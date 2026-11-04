import * as repostspace from "@distilled.cloud/aws/repostspace";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Redacted from "effect/Redacted";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags } from "../../Tags.js";
/** Unwrap a distilled sensitive value into its plain string. */
const unwrapSensitive = (value) => value === undefined
    ? undefined
    : Redacted.isRedacted(value)
        ? Redacted.value(value)
        : value;
/**
 * An AWS re:Post Private space — a private, organization-scoped version of
 * AWS re:Post with curated Q&A, articles, and selected public content.
 *
 * re:Post Private is a paid feature (Basic or Standard tier) that requires
 * AWS IAM Identity Center to be enabled in the account. Space provisioning
 * is asynchronous and can take tens of minutes; the provider waits for the
 * space to reach `CREATE_COMPLETED` before returning.
 * ### Creating a Space
 * **Example:** Basic Space
 * ```typescript
 * import * as RePostSpace from "alchemy/AWS/RePostSpace";
 *
 * const space = yield* RePostSpace.Space("Support", {
 *   subdomain: "my-org-support",
 *   tier: "BASIC",
 * });
 * ```
 *
 * **Example:** Space with Description and Tags
 * ```typescript
 * const space = yield* RePostSpace.Space("Engineering", {
 *   name: "Engineering Knowledge Base",
 *   subdomain: "my-org-engineering",
 *   tier: "STANDARD",
 *   description: "Internal Q&A for the engineering org",
 *   tags: { team: "platform" },
 * });
 * ```
 *
 * ### Encryption
 * **Example:** Space with a Customer-Managed KMS Key
 * ```typescript
 * const space = yield* RePostSpace.Space("Secure", {
 *   subdomain: "my-org-secure",
 *   userKMSKey: key.keyArn,
 * });
 * ```
 *
 * @resource
 */
export const Space = Resource("AWS.RePostSpace.Space");
const DEFAULT_TIER = "BASIC";
/**
 * Raised when a re:Post Private space enters a terminal failure state
 * (`CREATE_FAILED`) or starts deleting while the provider is waiting for
 * provisioning to complete.
 */
export class RePostSpaceProvisioningFailed extends Data.TaggedError("RePostSpaceProvisioningFailed") {
}
/** Internal marker error driving the bounded readiness retry loop. */
class RePostSpaceNotReady extends Data.TaggedError("RePostSpaceNotReady") {
}
const sameStringSet = (a, b) => {
    const left = [...new Set(a ?? [])].sort();
    const right = [...new Set(b ?? [])].sort();
    return left.length === right.length && left.every((v, i) => v === right[i]);
};
export const SpaceProvider = () => Provider.effect(Space, Effect.gen(function* () {
    const toName = (id, props) => props.name
        ? Effect.succeed(props.name)
        : createPhysicalName({ id, maxLength: 30 });
    const toSubdomain = (id, props) => props.subdomain
        ? Effect.succeed(props.subdomain)
        : createPhysicalName({ id, maxLength: 63, lowercase: true });
    const getSpaceOrUndefined = Effect.fn(function* (spaceId) {
        return yield* repostspace
            .getSpace({ spaceId })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    // Locate a live (not deleting/deleted) space by display name. Space
    // IDs are auto-assigned, so this is the fallback when the state
    // output cache is absent (e.g. after a past persistence failure).
    const findByName = Effect.fn(function* (name) {
        const chunk = yield* repostspace.listSpaces
            .items({})
            .pipe(Stream.runCollect);
        return Array.from(chunk).find((space) => unwrapSensitive(space.name) === name &&
            !space.status.startsWith("DELETE"));
    });
    const readSpaceTags = Effect.fn(function* (arn) {
        const response = yield* repostspace
            .listTagsForResource({ resourceArn: arn })
            .pipe(Effect.catch(() => Effect.succeed(undefined)));
        const tags = {};
        for (const [key, value] of Object.entries(response?.tags ?? {})) {
            if (value !== undefined)
                tags[key] = value;
        }
        return tags;
    });
    // Explicitly-typed pipeable retry helper. Inlining `Effect.retry` in a
    // provider lifecycle op leaks `Retry.Return`'s conditional into
    // declaration emit and widens the provider layer to `unknown` R for
    // every consumer of `AWS.providers()`.
    const retryWhileSpaceNotReady = (self) => Effect.retry(self, {
        while: (e) => e._tag === "RePostSpaceNotReady",
        schedule: Schedule.max([
            Schedule.fixed("30 seconds"),
            Schedule.recurs(80),
        ]),
    });
    // Bounded readiness wait. Space provisioning is asynchronous and can
    // take ~30 minutes; budget 40 min (80 * 30s). CREATE_FAILED and any
    // DELETE* status are terminal failures and stop the retry loop.
    const waitForCreated = Effect.fn(function* (spaceId) {
        return yield* retryWhileSpaceNotReady(Effect.gen(function* () {
            const space = yield* repostspace.getSpace({ spaceId });
            if (space.status === "CREATE_FAILED" ||
                space.status.startsWith("DELETE")) {
                return yield* Effect.fail(new RePostSpaceProvisioningFailed({
                    spaceId,
                    status: space.status,
                }));
            }
            if (space.status !== "CREATE_COMPLETED") {
                return yield* Effect.fail(new RePostSpaceNotReady({ spaceId, status: space.status }));
            }
            return space;
        }));
    });
    const toAttrs = Effect.fn(function* (space) {
        return {
            spaceId: space.spaceId,
            spaceArn: space.arn,
            name: unwrapSensitive(space.name) ?? "",
            status: space.status,
            configurationStatus: space.configurationStatus,
            clientId: space.clientId,
            identityStoreId: space.identityStoreId,
            applicationArn: space.applicationArn,
            description: unwrapSensitive(space.description),
            vanityDomain: space.vanityDomain,
            vanityDomainStatus: space.vanityDomainStatus,
            randomDomain: space.randomDomain,
            customerRoleArn: space.customerRoleArn,
            tier: space.tier,
            storageLimit: space.storageLimit,
            userKMSKey: space.userKMSKey,
            tags: yield* readSpaceTags(space.arn),
        };
    });
    return Space.Provider.of({
        stables: ["spaceId", "spaceArn", "clientId"],
        list: () => Effect.gen(function* () {
            const chunk = yield* repostspace.listSpaces
                .items({})
                .pipe(Stream.runCollect);
            const items = yield* Effect.forEach(Array.from(chunk), (space) => repostspace.getSpace({ spaceId: space.spaceId }).pipe(Effect.flatMap((full) => toAttrs(full)), 
            // A space can vanish between enumeration and hydration.
            Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined))), { concurrency: 4 });
            return items.filter(Predicate.isNotUndefined);
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            let spaceId = output?.spaceId;
            if (spaceId === undefined) {
                const name = yield* toName(id, olds ?? {});
                const found = yield* findByName(name);
                spaceId = found?.spaceId;
            }
            if (spaceId === undefined)
                return undefined;
            const space = yield* getSpaceOrUndefined(spaceId);
            if (space === undefined || space.status.startsWith("DELETE")) {
                return undefined;
            }
            const attrs = yield* toAttrs(space);
            return (yield* hasAlchemyTags(id, attrs.tags))
                ? attrs
                : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            const n = news ?? {};
            const o = olds ?? {};
            // Create-only properties force a replacement.
            if ((yield* toName(id, o)) !== (yield* toName(id, n))) {
                return { action: "replace" };
            }
            if ((yield* toSubdomain(id, o)) !== (yield* toSubdomain(id, n))) {
                return { action: "replace" };
            }
            if (n.userKMSKey !== o.userKMSKey) {
                return { action: "replace" };
            }
            // tier, description, roleArn, supportedEmailDomains update in place.
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const props = news ?? {};
            const name = output?.name ?? (yield* toName(id, props));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...props.tags };
            const desiredTier = props.tier ?? DEFAULT_TIER;
            // 1. Observe — cloud state is authoritative; output is only an
            //    id cache. Fall through to a by-name lookup when the cached
            //    space no longer exists.
            let spaceId = output?.spaceId;
            if (spaceId !== undefined) {
                const cached = yield* getSpaceOrUndefined(spaceId);
                if (cached === undefined || cached.status.startsWith("DELETE")) {
                    spaceId = undefined;
                }
            }
            if (spaceId === undefined) {
                const found = yield* findByName(name);
                spaceId = found?.spaceId;
            }
            // 2. Ensure — create if missing; a ConflictException means a peer
            //    created it concurrently (or the name/subdomain is taken), so
            //    fall back to the by-name lookup.
            if (spaceId === undefined) {
                const subdomain = yield* toSubdomain(id, props);
                spaceId = yield* repostspace
                    .createSpace({
                    name,
                    subdomain,
                    tier: desiredTier,
                    description: props.description,
                    userKMSKey: props.userKMSKey,
                    roleArn: props.roleArn,
                    supportedEmailDomains: props.supportedEmailDomains,
                    tags: desiredTags,
                })
                    .pipe(Effect.map((r) => r.spaceId), Effect.catchTag("ConflictException", (error) => findByName(name).pipe(Effect.flatMap((existing) => existing !== undefined
                    ? Effect.succeed(existing.spaceId)
                    : Effect.fail(error)))));
                yield* session.note(`created space ${spaceId}, provisioning...`);
            }
            // Provisioning is asynchronous — wait (bounded) for the space to
            // become usable before syncing mutable aspects.
            let observed = yield* waitForCreated(spaceId);
            // 3. Sync — compute the update delta from OBSERVED state and call
            //    updateSpace only when something actually changed.
            const update = {};
            let mutated = false;
            if (props.description !== undefined &&
                props.description !== unwrapSensitive(observed.description)) {
                update.description = props.description;
                mutated = true;
            }
            if (props.tier !== undefined && props.tier !== observed.tier) {
                update.tier = props.tier;
                mutated = true;
            }
            if (props.roleArn !== undefined &&
                props.roleArn !== observed.customerRoleArn) {
                update.roleArn = props.roleArn;
                mutated = true;
            }
            if (props.supportedEmailDomains !== undefined) {
                const observedDomains = (observed.supportedEmailDomains?.allowedDomains ?? []).map((domain) => unwrapSensitive(domain) ?? "");
                if (props.supportedEmailDomains.enabled !==
                    observed.supportedEmailDomains?.enabled ||
                    !sameStringSet(props.supportedEmailDomains.allowedDomains, observedDomains)) {
                    update.supportedEmailDomains = props.supportedEmailDomains;
                    mutated = true;
                }
            }
            if (mutated) {
                yield* repostspace.updateSpace({ spaceId, ...update });
                const refreshed = yield* getSpaceOrUndefined(spaceId);
                if (refreshed !== undefined)
                    observed = refreshed;
            }
            // 3b. Sync tags — diff against OBSERVED cloud tags so adoption
            //     converges.
            const observedTags = yield* readSpaceTags(observed.arn);
            const { removed, upsert } = diffTags(observedTags, desiredTags);
            if (upsert.length > 0) {
                yield* repostspace.tagResource({
                    resourceArn: observed.arn,
                    tags: Object.fromEntries(upsert.map((t) => [t.Key, t.Value])),
                });
            }
            if (removed.length > 0) {
                yield* repostspace.untagResource({
                    resourceArn: observed.arn,
                    tagKeys: removed,
                });
            }
            yield* session.note(spaceId);
            return yield* toAttrs(observed);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* repostspace
                .deleteSpace({ spaceId: output.spaceId })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=Space.js.map