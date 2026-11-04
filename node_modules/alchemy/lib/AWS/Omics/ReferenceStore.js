import * as omics from "@distilled.cloud/aws/omics";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { fetchOmicsTags, syncOmicsTags } from "./internal.js";
/**
 * An Amazon HealthOmics reference store — a container for reference genomes
 * that read sets are aligned against.
 *
 * A reference store name is auto-generated from the app, stage, and logical
 * ID unless you provide one. HealthOmics offers no update-store API, so any
 * change to `name`, `description`, or `sseConfig` replaces the store. A store
 * can only be deleted once it contains no reference genomes.
 * ### Creating a Reference Store
 * **Example:** Basic Reference Store
 * ```typescript
 * import * as Omics from "alchemy/AWS/Omics";
 *
 * const store = yield* Omics.ReferenceStore("References");
 * ```
 *
 * **Example:** Named Reference Store with Description
 * ```typescript
 * const store = yield* Omics.ReferenceStore("References", {
 *   name: "human-references",
 *   description: "GRCh38 reference genomes",
 * });
 * ```
 *
 * ### Encryption
 * **Example:** Customer-managed KMS key
 * ```typescript
 * const store = yield* Omics.ReferenceStore("References", {
 *   sseConfig: {
 *     type: "KMS",
 *     keyArn: "arn:aws:kms:us-east-1:123456789012:key/abc-123",
 *   },
 * });
 * ```
 *
 * @resource
 */
export const ReferenceStore = Resource("AWS.Omics.ReferenceStore");
export const ReferenceStoreProvider = () => Provider.effect(ReferenceStore, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return props.name ?? (yield* createPhysicalName({ id, maxLength: 96 }));
    });
    const toAttrs = (store) => ({
        referenceStoreId: store.id,
        referenceStoreArn: store.arn,
        name: store.name ?? "",
        creationTime: store.creationTime.toISOString(),
    });
    return ReferenceStore.Provider.of({
        stables: [
            "referenceStoreId",
            "referenceStoreArn",
            "name",
            "creationTime",
        ],
        list: () => omics.listReferenceStores.items({}).pipe(Stream.map(toAttrs), Stream.runCollect, Effect.map((chunk) => Array.from(chunk))),
        read: Effect.fn(function* ({ id, output }) {
            if (output?.referenceStoreId === undefined)
                return undefined;
            const found = yield* omics
                .getReferenceStore({ id: output.referenceStoreId })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            if (found === undefined)
                return undefined;
            const attrs = toAttrs(found);
            const tags = yield* fetchOmicsTags(found.arn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const prev = olds ?? {};
            const oldName = yield* createName(id, prev);
            const newName = yield* createName(id, news);
            if (oldName !== newName)
                return { action: "replace" };
            if ((prev.description ?? "") !== (news.description ?? "")) {
                return { action: "replace" };
            }
            if (prev.sseConfig?.type !== news.sseConfig?.type ||
                prev.sseConfig?.keyArn !== news.sseConfig?.keyArn) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.name ?? (yield* createName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // OBSERVE — the store id is a server-generated cache; if the store
            // was deleted out-of-band, getReferenceStore returns NotFound and we
            // recreate.
            let store = output?.referenceStoreId === undefined
                ? undefined
                : yield* omics
                    .getReferenceStore({ id: output.referenceStoreId })
                    .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            // ENSURE — create if missing. The store name is not a unique key, so
            // there is no AlreadyExists race to tolerate here.
            if (store === undefined) {
                store = yield* omics.createReferenceStore({
                    name,
                    description: news.description,
                    sseConfig: news.sseConfig,
                    tags: desiredTags,
                });
            }
            // SYNC TAGS — diff against observed cloud tags so adoption converges.
            yield* syncOmicsTags(store.arn, desiredTags);
            yield* session.note(store.id);
            return toAttrs(store);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* omics
                .deleteReferenceStore({ id: output.referenceStoreId })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=ReferenceStore.js.map