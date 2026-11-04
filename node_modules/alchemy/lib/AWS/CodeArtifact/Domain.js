import * as codeartifact from "@distilled.cloud/aws/codeartifact";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags } from "../../Tags.js";
/**
 * An AWS CodeArtifact domain — the top-level container that groups a set of
 * package repositories and provides a single point for encryption, ownership
 * and cross-account access control.
 *
 * ### Creating a Domain
 * **Example:** Basic Domain
 * ```typescript
 * const domain = yield* CodeArtifact.Domain("packages", {});
 * ```
 *
 * **Example:** Domain with a customer-managed KMS key
 * ```typescript
 * const domain = yield* CodeArtifact.Domain("packages", {
 *   domainName: "my-org",
 *   encryptionKey: key.keyArn,
 *   tags: { team: "platform" },
 * });
 * ```
 *
 * @resource
 */
export const Domain = Resource("AWS.CodeArtifact.Domain");
/** Convert a CodeArtifact wire tag list into a plain record. */
const toTagRecord = (tags) => Object.fromEntries((tags ?? [])
    .filter((tag) => typeof tag.key === "string" && typeof tag.value === "string")
    .map((tag) => [tag.key, tag.value]));
export const DomainProvider = () => Provider.effect(Domain, Effect.gen(function* () {
    const toName = (id, props) => props.domainName
        ? Effect.succeed(props.domainName)
        : createPhysicalName({ id, maxLength: 50 });
    const getDomain = Effect.fn(function* (name) {
        const response = yield* codeartifact
            .describeDomain({ domain: name })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        return response?.domain;
    });
    const toAttrs = (domain, name) => ({
        domainName: domain.name ?? name,
        domainArn: domain.arn,
        owner: domain.owner ?? "",
        status: domain.status ?? "Active",
        encryptionKey: domain.encryptionKey ?? "",
        s3BucketArn: domain.s3BucketArn ?? "",
    });
    const syncTags = Effect.fn(function* (arn, desiredTags) {
        const observed = yield* codeartifact
            .listTagsForResource({ resourceArn: arn })
            .pipe(Effect.catch(() => Effect.succeed(undefined)));
        const { removed, upsert } = diffTags(toTagRecord(observed?.tags), desiredTags);
        if (upsert.length > 0) {
            yield* codeartifact.tagResource({
                resourceArn: arn,
                tags: upsert.map((t) => ({ key: t.Key, value: t.Value })),
            });
        }
        if (removed.length > 0) {
            yield* codeartifact.untagResource({
                resourceArn: arn,
                tagKeys: removed,
            });
        }
    });
    return {
        stables: ["domainName", "domainArn", "owner"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            if ((yield* toName(id, olds ?? {})) !== (yield* toName(id, news ?? {}))) {
                return { action: "replace" };
            }
            // The encryption key is immutable — replace on change.
            if ((news?.encryptionKey ?? undefined) !==
                (olds?.encryptionKey ?? undefined)) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.domainName ?? (yield* toName(id, olds ?? {}));
            const domain = yield* getDomain(name);
            if (domain?.arn === undefined)
                return undefined;
            const attrs = toAttrs(domain, name);
            const tags = yield* codeartifact
                .listTagsForResource({ resourceArn: attrs.domainArn })
                .pipe(Effect.map((res) => toTagRecord(res.tags)), Effect.catch(() => Effect.succeed({})));
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.domainName ?? (yield* toName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // 1. Observe — cloud state is authoritative.
            let observed = yield* getDomain(name);
            // 2. Ensure — domains are immutable; create if missing. Tolerate a
            // concurrent-create race as an existing domain, and retry through
            // the deletion-propagation window where a freshly deleted domain
            // still rejects creates (ConflictException) while describeDomain
            // already reports it gone.
            if (observed?.arn === undefined) {
                observed = yield* codeartifact
                    .createDomain({
                    domain: name,
                    encryptionKey: news.encryptionKey,
                    tags: Object.entries(desiredTags).map(([key, value]) => ({
                        key,
                        value,
                    })),
                })
                    .pipe(Effect.map((res) => res.domain), Effect.catchTag("ConflictException", () => getDomain(name)), Effect.repeat({
                    until: (domain) => domain?.arn !== undefined,
                    schedule: Schedule.spaced("2 seconds"),
                    times: 10,
                }));
            }
            // 3. Sync tags — diff against OBSERVED cloud tags.
            yield* syncTags(observed.arn, desiredTags);
            // 4. Return fresh attributes.
            yield* session.note(name);
            return toAttrs(observed, name);
        }),
        delete: Effect.fn(function* ({ output }) {
            // DeleteDomain is idempotent — deleting a non-existent domain
            // succeeds (its typed error union has no not-found variant). A
            // domain whose repositories were deleted moments earlier can
            // transiently Conflict while those deletions propagate.
            yield* codeartifact.deleteDomain({ domain: output.domainName }).pipe(Effect.retry({
                while: (e) => e._tag === "ConflictException",
                schedule: Schedule.spaced("2 seconds"),
                times: 10,
            }));
        }),
        list: () => codeartifact.listDomains.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
            .flatMap((page) => page.domains ?? [])
            .flatMap((d) => d.arn !== undefined && d.name !== undefined
            ? [
                {
                    domainName: d.name,
                    domainArn: d.arn,
                    owner: d.owner ?? "",
                    status: d.status ?? "Active",
                    encryptionKey: d.encryptionKey ?? "",
                    s3BucketArn: "",
                },
            ]
            : []))),
    };
}));
//# sourceMappingURL=Domain.js.map