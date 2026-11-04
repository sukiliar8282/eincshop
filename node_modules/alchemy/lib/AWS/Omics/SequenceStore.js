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
 * An Amazon HealthOmics sequence store — a container for genomics read sets
 * (FASTQ, BAM, CRAM).
 *
 * A sequence store name is auto-generated from the app, stage, and logical ID
 * unless you provide one. HealthOmics offers no update-store API, so any
 * change to an immutable property (name, description, encryption, fallback
 * location, ETag algorithm) replaces the store. A store can only be deleted
 * once it contains no read sets.
 * ### Creating a Sequence Store
 * **Example:** Basic Sequence Store
 * ```typescript
 * import * as Omics from "alchemy/AWS/Omics";
 *
 * const store = yield* Omics.SequenceStore("Reads");
 * ```
 *
 * **Example:** Sequence Store with Fallback Location
 * ```typescript
 * const store = yield* Omics.SequenceStore("Reads", {
 *   name: "sample-reads",
 *   fallbackLocation: "s3://my-bucket/omics-fallback/",
 *   eTagAlgorithmFamily: "SHA256up",
 * });
 * ```
 *
 * ### Encryption
 * **Example:** Customer-managed KMS key
 * ```typescript
 * const store = yield* Omics.SequenceStore("Reads", {
 *   sseConfig: {
 *     type: "KMS",
 *     keyArn: "arn:aws:kms:us-east-1:123456789012:key/abc-123",
 *   },
 * });
 * ```
 *
 * @resource
 */
export const SequenceStore = Resource("AWS.Omics.SequenceStore");
export const SequenceStoreProvider = () => Provider.effect(SequenceStore, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return props.name ?? (yield* createPhysicalName({ id, maxLength: 96 }));
    });
    const toAttrs = (store) => ({
        sequenceStoreId: store.id,
        sequenceStoreArn: store.arn,
        name: store.name ?? "",
        creationTime: store.creationTime.toISOString(),
    });
    return SequenceStore.Provider.of({
        stables: [
            "sequenceStoreId",
            "sequenceStoreArn",
            "name",
            "creationTime",
        ],
        list: () => omics.listSequenceStores.items({}).pipe(Stream.map(toAttrs), Stream.runCollect, Effect.map((chunk) => Array.from(chunk))),
        read: Effect.fn(function* ({ id, output }) {
            if (output?.sequenceStoreId === undefined)
                return undefined;
            const found = yield* omics
                .getSequenceStore({ id: output.sequenceStoreId })
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
                prev.sseConfig?.keyArn !== news.sseConfig?.keyArn ||
                (prev.fallbackLocation ?? "") !== (news.fallbackLocation ?? "") ||
                (prev.eTagAlgorithmFamily ?? "") !==
                    (news.eTagAlgorithmFamily ?? "")) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.name ?? (yield* createName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            let store = output?.sequenceStoreId === undefined
                ? undefined
                : yield* omics
                    .getSequenceStore({ id: output.sequenceStoreId })
                    .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            if (store === undefined) {
                store = yield* omics.createSequenceStore({
                    name,
                    description: news.description,
                    sseConfig: news.sseConfig,
                    fallbackLocation: news.fallbackLocation,
                    eTagAlgorithmFamily: news.eTagAlgorithmFamily,
                    propagatedSetLevelTags: news.propagatedSetLevelTags,
                    tags: desiredTags,
                });
            }
            yield* syncOmicsTags(store.arn, desiredTags);
            yield* session.note(store.id);
            return toAttrs(store);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* omics
                .deleteSequenceStore({ id: output.sequenceStoreId })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=SequenceStore.js.map