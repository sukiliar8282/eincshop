import * as datazone from "@distilled.cloud/aws/datazone";
import * as iam from "@distilled.cloud/aws/iam";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
import { syncDataZoneTags, toTagRecord, unredact } from "./internal.js";
/**
 * An Amazon DataZone domain — the top-level container for data-governance
 * projects, environments, glossaries, and assets.
 *
 * `Domain` owns the domain lifecycle. Domain creation is asynchronous
 * (typically 1–2 minutes) and is polled to `AVAILABLE` with a bounded wait.
 * An execution role is created automatically (trusted by
 * `datazone.amazonaws.com`, with the `AmazonDataZoneDomainExecutionRolePolicy`
 * managed policy) unless an explicit `domainExecutionRole` is supplied.
 *
 * ### Creating Domains
 * **Example:** Minimal Domain
 * ```typescript
 * import * as DataZone from "alchemy/AWS/DataZone";
 *
 * const domain = yield* DataZone.Domain("governance", {
 *   description: "Company-wide data governance domain",
 * });
 * ```
 *
 * **Example:** Domain with an Explicit Execution Role
 * ```typescript
 * const domain = yield* DataZone.Domain("governance", {
 *   name: "acme-governance",
 *   domainExecutionRole: role.roleArn,
 *   tags: { Team: "data-platform" },
 * });
 * ```
 *
 * ### Using the Domain
 * **Example:** Create a Project in the Domain
 * ```typescript
 * const project = yield* DataZone.Project("analytics", {
 *   domainId: domain.domainId,
 *   description: "Analytics team project",
 * });
 * ```
 *
 * @resource
 */
export const Domain = Resource("AWS.DataZone.Domain");
/** The domain never leaves a failed create — surface it as a typed error. */
export class DomainCreationFailed extends Data.TaggedError("AWS.DataZone.DomainCreationFailed") {
}
/** Domain status values indicating an in-flight transition to wait out. */
const DOMAIN_TRANSIENT = new Set(["CREATING", "DELETING"]);
/**
 * A freshly created (or re-observed) IAM role is eventually consistent;
 * `createDomain` / `updateDomain` can transiently reject a role DataZone
 * cannot yet assume. Wrapped in an explicitly-typed helper so the
 * `Effect.retry` conditional return type does not leak into declaration emit
 * and widen the provider layer's requirement to `unknown` (see PATTERNS §7).
 */
const retryWhileRoleAssumeFails = (self) => Effect.retry(self, {
    while: (e) => (e._tag === "ValidationException" ||
        e._tag === "AccessDeniedException") &&
        "message" in e &&
        typeof e.message === "string" &&
        (e.message.toLowerCase().includes("role") ||
            e.message.toLowerCase().includes("assume")),
    schedule: Schedule.max([Schedule.fixed("3 seconds"), Schedule.recurs(10)]),
});
const DOMAIN_EXECUTION_MANAGED_POLICY = "arn:aws:iam::aws:policy/service-role/AmazonDataZoneDomainExecutionRolePolicy";
export const DomainProvider = () => Provider.effect(Domain, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return props.name ?? (yield* createPhysicalName({ id, maxLength: 64 }));
    });
    const createRoleName = (id) => createPhysicalName({ id, maxLength: 64 });
    // A deleted (or never-existing) domain is reported by GetDomain as
    // AccessDeniedException ("User is not permitted to perform operation:
    // GetDomain"), NOT ResourceNotFoundException — DataZone evaluates
    // domain-scoped authorization before existence. Both mean "absent".
    const getDomainOrUndefined = Effect.fn(function* (identifier) {
        return yield* datazone.getDomain({ identifier }).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)), Effect.catchTag("AccessDeniedException", () => Effect.succeed(undefined)));
    });
    const findByName = Effect.fn(function* (name) {
        const pages = yield* datazone.listDomains
            .pages({})
            .pipe(Stream.runCollect);
        const summary = Array.from(pages)
            .flatMap((page) => page.items ?? [])
            .find((s) => unredact(s.name) === name &&
            s.status !== "DELETING" &&
            s.status !== "DELETED");
        return summary?.id;
    });
    // Poll the domain to a settled (non-transient) status. V1 domains are
    // usually AVAILABLE synchronously; V2 creation takes 1-2 minutes —
    // bounded at ~3 minutes. An "absent" observation keeps polling: right
    // after createDomain the creator's user profile can lag, surfacing the
    // same AccessDenied that a deleted domain does.
    const waitForSettled = Effect.fn(function* (identifier) {
        return yield* getDomainOrUndefined(identifier).pipe(Effect.repeat({
            schedule: Schedule.fixed("5 seconds"),
            until: (domain) => domain !== undefined && !DOMAIN_TRANSIENT.has(domain.status),
            times: 36,
        }));
    });
    // Poll the domain until it no longer exists. Domain deletion typically
    // completes in 1-2 minutes — bounded at ~3 minutes.
    const waitForGone = Effect.fn(function* (identifier) {
        yield* getDomainOrUndefined(identifier).pipe(Effect.repeat({
            schedule: Schedule.fixed("5 seconds"),
            until: (domain) => domain === undefined || domain.status === "DELETED",
            times: 36,
        }));
    });
    const domainArnOf = (region, accountId, domainId) => `arn:aws:datazone:${region}:${accountId}:domain/${domainId}`;
    const ensureExecutionRole = Effect.fn(function* ({ id, roleName, accountId, }) {
        const tags = yield* createInternalTags(id);
        const role = yield* iam
            .createRole({
            RoleName: roleName,
            AssumeRolePolicyDocument: JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Principal: { Service: "datazone.amazonaws.com" },
                        Action: ["sts:AssumeRole", "sts:TagSession"],
                        Condition: {
                            StringEquals: { "aws:SourceAccount": accountId },
                            "ForAllValues:StringLike": { "aws:TagKeys": "datazone*" },
                        },
                    },
                ],
            }),
            Tags: Object.entries(tags).map(([Key, Value]) => ({ Key, Value })),
        })
            .pipe(Effect.catchTag("EntityAlreadyExistsException", () => iam.getRole({ RoleName: roleName })));
        yield* iam
            .attachRolePolicy({
            RoleName: roleName,
            PolicyArn: DOMAIN_EXECUTION_MANAGED_POLICY,
        })
            .pipe(
        // attaching an already-attached managed policy is a no-op, but
        // tolerate racy duplicates anyway.
        Effect.catchTag("InvalidInputException", () => Effect.void));
        return role.Role.Arn;
    });
    return Domain.Provider.of({
        stables: ["domainId", "domainArn", "rootDomainUnitId"],
        list: () => Effect.gen(function* () {
            const { region, accountId } = yield* AWSEnvironment.current;
            const pages = yield* datazone.listDomains
                .pages({})
                .pipe(Stream.runCollect);
            const summaries = Array.from(pages)
                .flatMap((page) => page.items ?? [])
                .filter((s) => s.status !== "DELETING" && s.status !== "DELETED");
            return summaries.map((s) => ({
                domainId: s.id,
                domainArn: s.arn ?? domainArnOf(region, accountId, s.id),
                name: unredact(s.name),
                status: s.status,
                portalUrl: s.portalUrl,
                rootDomainUnitId: undefined,
                domainExecutionRole: "",
                roleName: undefined,
            }));
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const { region, accountId } = yield* AWSEnvironment.current;
            const domainId = output?.domainId ??
                (yield* findByName(output?.name ?? (yield* createName(id, olds ?? {}))));
            if (domainId === undefined)
                return undefined;
            const domain = yield* getDomainOrUndefined(domainId);
            if (domain === undefined ||
                domain.status === "DELETING" ||
                domain.status === "DELETED") {
                return undefined;
            }
            const attrs = {
                domainId: domain.id,
                domainArn: domain.arn ?? domainArnOf(region, accountId, domain.id),
                name: domain.name ?? "",
                status: domain.status,
                portalUrl: domain.portalUrl,
                rootDomainUnitId: domain.rootDomainUnitId,
                domainExecutionRole: domain.domainExecutionRole,
                roleName: output?.roleName,
            };
            const tags = toTagRecord(domain.tags);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            if (olds?.kmsKeyIdentifier !== news?.kmsKeyIdentifier) {
                return { action: "replace" };
            }
            if (olds?.domainVersion !== news?.domainVersion) {
                return { action: "replace" };
            }
            // name, description, execution role, service role, SSO, and tags
            // all converge via updateDomain / tagResource.
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const { accountId, region } = yield* AWSEnvironment.current;
            const name = yield* createName(id, news);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // Ensure the execution role first — the domain cannot exist without
            // one. Managed unless an explicit domainExecutionRole is provided.
            let executionRoleArn = news.domainExecutionRole;
            let roleName = output?.roleName;
            if (executionRoleArn === undefined) {
                roleName = roleName ?? (yield* createRoleName(id));
                executionRoleArn = yield* ensureExecutionRole({
                    id,
                    roleName,
                    accountId,
                });
            }
            // 1. OBSERVE — cloud state is authoritative; output is only an id
            //    cache. Fall back to a name lookup after state loss.
            let domain = output?.domainId
                ? yield* getDomainOrUndefined(output.domainId)
                : undefined;
            if (domain === undefined) {
                const foundId = yield* findByName(name);
                if (foundId !== undefined) {
                    domain = yield* getDomainOrUndefined(foundId);
                }
            }
            if (domain === undefined) {
                // 2. ENSURE — create and wait out the async provisioning.
                const created = yield* retryWhileRoleAssumeFails(datazone.createDomain({
                    name,
                    description: news.description,
                    domainExecutionRole: executionRoleArn,
                    serviceRole: news.serviceRole,
                    kmsKeyIdentifier: news.kmsKeyIdentifier,
                    domainVersion: news.domainVersion,
                    singleSignOn: news.singleSignOn,
                    tags: desiredTags,
                }));
                domain = (yield* waitForSettled(created.id)) ?? undefined;
                if (domain === undefined || domain.status !== "AVAILABLE") {
                    return yield* new DomainCreationFailed({
                        domainId: created.id,
                        status: domain?.status ?? "CREATING",
                    });
                }
            }
            else {
                // 3. SYNC — wait out any in-flight transition, then converge the
                //    mutable aspects by diffing OBSERVED state against desired.
                domain = (yield* waitForSettled(domain.id)) ?? domain;
                const drifted = domain.name !== name ||
                    (domain.description ?? undefined) !==
                        (news.description ?? undefined) ||
                    domain.domainExecutionRole !== executionRoleArn ||
                    (news.serviceRole !== undefined &&
                        domain.serviceRole !== news.serviceRole);
                if (drifted) {
                    yield* retryWhileRoleAssumeFails(datazone.updateDomain({
                        identifier: domain.id,
                        name,
                        description: news.description,
                        domainExecutionRole: executionRoleArn,
                        serviceRole: news.serviceRole,
                        singleSignOn: news.singleSignOn,
                    }));
                    domain = (yield* getDomainOrUndefined(domain.id)) ?? domain;
                }
            }
            const domainId = domain.id;
            const domainArn = domain.arn ?? domainArnOf(region, accountId, domainId);
            // 3b. SYNC TAGS — diff against OBSERVED cloud tags (create-time tags
            //     only apply on first create; adoption may carry foreign tags).
            yield* syncDataZoneTags(domainArn, toTagRecord(domain.tags), desiredTags);
            yield* session.note(domainId);
            return {
                domainId,
                domainArn,
                name: domain.name ?? name,
                status: domain.status,
                portalUrl: domain.portalUrl,
                rootDomainUnitId: domain.rootDomainUnitId,
                domainExecutionRole: executionRoleArn,
                roleName,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* datazone
                .deleteDomain({
                identifier: output.domainId,
                skipDeletionCheck: true,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void), 
            // an already-deleted domain surfaces as AccessDenied ("User is
            // not permitted to perform operation: DeleteDomain") — DataZone
            // checks domain-scoped auth before existence.
            Effect.catchTag("AccessDeniedException", () => Effect.void), 
            // a concurrent DELETING domain rejects a second delete — the
            // wait below observes it through to gone either way.
            Effect.catchTag("ConflictException", () => Effect.void));
            yield* waitForGone(output.domainId);
            // Tear down the managed execution role (absent when an explicit
            // domainExecutionRole was supplied). Every step tolerates a
            // partially or fully removed role.
            if (output.roleName !== undefined) {
                const roleName = output.roleName;
                yield* iam
                    .detachRolePolicy({
                    RoleName: roleName,
                    PolicyArn: DOMAIN_EXECUTION_MANAGED_POLICY,
                })
                    .pipe(Effect.catchTag("NoSuchEntityException", () => Effect.void));
                yield* iam
                    .deleteRole({ RoleName: roleName })
                    .pipe(Effect.catchTag("NoSuchEntityException", () => Effect.void));
            }
        }),
    });
}));
//# sourceMappingURL=Domain.js.map