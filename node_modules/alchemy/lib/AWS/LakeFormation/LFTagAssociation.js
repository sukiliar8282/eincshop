import * as lf from "@distilled.cloud/aws/lakeformation";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { retryWhileConcurrentModification } from "./internal.js";
import { toWireResource, } from "./ResourceSpec.js";
/**
 * Lake Formation returns per-tag failures with a 200 response — surfaced as
 * a typed error so partial failures fail the deploy.
 */
export class LFTagAssociationError extends Data.TaggedError("LFTagAssociationError") {
}
/**
 * Attaches LF-tag values to a Data Catalog resource (database, table, or
 * columns) for Lake Formation tag-based access control.
 *
 * Requires the caller to be a data lake administrator (or hold `ASSOCIATE`
 * on the LF-tags) — see
 * {@link DataLakeSettings | AWS.LakeFormation.DataLakeSettings}.
 *
 * ### Tagging Resources
 * **Example:** Tag a Database
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const association = yield* AWS.LakeFormation.LFTagAssociation("DbEnvTag", {
 *   resource: { database: { name: database.databaseName } },
 *   lfTags: [{ tagKey: envTag.tagKey, tagValues: ["prod"] }],
 * });
 * ```
 *
 * **Example:** Tag a Table
 * ```typescript
 * const association = yield* AWS.LakeFormation.LFTagAssociation("TableTag", {
 *   resource: {
 *     table: { databaseName: database.databaseName, name: "events" },
 *   },
 *   lfTags: [{ tagKey: envTag.tagKey, tagValues: ["dev"] }],
 * });
 * ```
 *
 * @resource
 */
export const LFTagAssociation = Resource("AWS.LakeFormation.LFTagAssociation");
const failuresToError = (operation, failures) => {
    const real = (failures ?? []).filter(
    // a failure to remove an already-detached / already-deleted tag is not
    // an error for a converging reconciler.
    (f) => f.Error?.ErrorCode !== "EntityNotFoundException");
    return real.length > 0
        ? Effect.fail(new LFTagAssociationError({
            message: `${operation} failed for ${real
                .map((f) => f.LFTag?.TagKey ?? "<unknown>")
                .join(", ")}: ${real
                .map((f) => f.Error?.ErrorMessage ?? f.Error?.ErrorCode ?? "")
                .join("; ")}`,
            failures: real,
        }))
        : Effect.void;
};
const sortedValues = (values) => [...(values ?? [])].sort();
export const LFTagAssociationProvider = () => Provider.effect(LFTagAssociation, Effect.gen(function* () {
    /** Observed tag assignments on the resource, keyed by tag key. */
    const observe = Effect.fn(function* (resource, catalogId) {
        const response = yield* lf
            .getResourceLFTags({
            Resource: resource,
            CatalogId: catalogId,
            ShowAssignedLFTags: true,
        })
            .pipe(Effect.catchTag("EntityNotFoundException", () => Effect.succeed({})));
        const pairs = [
            ...(response.LFTagOnDatabase ?? []),
            ...(response.LFTagsOnTable ?? []),
        ];
        return new Map(pairs.map((p) => [p.TagKey, [...p.TagValues]]));
    });
    return LFTagAssociation.Provider.of({
        // Associations are keyed by their parent Data Catalog resource —
        // there is no account-wide enumeration API.
        list: () => Effect.succeed([]),
        read: Effect.fn(function* ({ olds, output }) {
            const resource = output?.resource ??
                (olds !== undefined ? toWireResource(olds.resource) : undefined);
            if (resource === undefined)
                return undefined;
            const catalogId = output?.catalogId ?? olds?.catalogId;
            const observed = yield* observe(resource, catalogId);
            const keys = (output?.lfTags ?? olds?.lfTags ?? []).map((t) => t.tagKey);
            const held = keys.filter((k) => observed.has(k));
            if (held.length === 0)
                return undefined;
            return {
                resource,
                lfTags: held.map((k) => ({
                    tagKey: k,
                    tagValues: observed.get(k),
                })),
                catalogId,
            };
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            if (JSON.stringify(toWireResource(news.resource)) !==
                JSON.stringify(toWireResource(olds.resource))) {
                return { action: "replace" };
            }
            if ((news.catalogId ?? undefined) !== (olds.catalogId ?? undefined)) {
                return { action: "replace" };
            }
            // lfTags → update
        }),
        reconcile: Effect.fn(function* ({ news, olds, session }) {
            const resource = toWireResource(news.resource);
            // 1. OBSERVE
            const observed = yield* observe(resource, news.catalogId);
            // 2. SYNC — detach keys we previously managed that were removed
            //    from the props.
            const newKeys = news.lfTags.map((t) => t.tagKey);
            const removedKeys = (olds?.lfTags ?? [])
                .map((t) => t.tagKey)
                .filter((k) => !newKeys.includes(k) && observed.has(k));
            if (removedKeys.length > 0) {
                const response = yield* lf
                    .removeLFTagsFromResource({
                    Resource: resource,
                    CatalogId: news.catalogId,
                    LFTags: removedKeys.map((k) => ({
                        TagKey: k,
                        TagValues: observed.get(k),
                    })),
                })
                    .pipe(retryWhileConcurrentModification);
                yield* failuresToError("RemoveLFTagsFromResource", response.Failures);
            }
            //    Assign missing/changed values (AddLFTagsToResource overwrites
            //    a key's existing value — verified live).
            const toApply = news.lfTags.filter((t) => JSON.stringify(sortedValues(observed.get(t.tagKey))) !==
                JSON.stringify(sortedValues(t.tagValues)));
            if (toApply.length > 0) {
                const response = yield* lf
                    .addLFTagsToResource({
                    Resource: resource,
                    CatalogId: news.catalogId,
                    LFTags: toApply.map((t) => ({
                        TagKey: t.tagKey,
                        TagValues: t.tagValues,
                        CatalogId: t.catalogId,
                    })),
                })
                    .pipe(retryWhileConcurrentModification);
                yield* failuresToError("AddLFTagsToResource", response.Failures);
            }
            // 3. RETURN
            yield* session.note(news.lfTags.map((t) => `${t.tagKey}=${t.tagValues}`).join(", "));
            return {
                resource,
                lfTags: news.lfTags.map((t) => ({
                    tagKey: t.tagKey,
                    tagValues: t.tagValues,
                })),
                catalogId: news.catalogId,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            // Observe first — only detach keys that are actually still
            // assigned (the tag or the parent resource may already be gone).
            const observed = yield* observe(output.resource, output.catalogId);
            const keys = output.lfTags
                .map((t) => t.tagKey)
                .filter((k) => observed.has(k));
            if (keys.length === 0)
                return;
            const response = yield* lf
                .removeLFTagsFromResource({
                Resource: output.resource,
                CatalogId: output.catalogId,
                LFTags: keys.map((k) => ({
                    TagKey: k,
                    TagValues: observed.get(k),
                })),
            })
                .pipe(retryWhileConcurrentModification, Effect.catchTag("EntityNotFoundException", () => Effect.succeed({})));
            yield* failuresToError("RemoveLFTagsFromResource", response.Failures);
        }),
    });
}));
//# sourceMappingURL=LFTagAssociation.js.map