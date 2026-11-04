import * as omics from "@distilled.cloud/aws/omics";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags, tagRecord } from "../../Tags.js";
import { syncOmicsTags } from "./internal.js";
// Variant store names must match `[a-z]([a-z0-9_]){0,254}` — the generated
// physical name (hyphens, mixed case) is coerced to fit.
const toStoreName = (raw) => {
    const sanitized = raw.toLowerCase().replace(/[^a-z0-9_]/g, "_");
    const prefixed = /^[a-z]/.test(sanitized) ? sanitized : `a${sanitized}`;
    return prefixed.slice(0, 255);
};
/**
 * An Amazon HealthOmics variant store — a container for genomic variant data
 * (VCF) aligned to a reference genome.
 *
 * A variant store name is auto-generated from the app, stage, and logical ID
 * unless you provide one. The `reference` and `sseConfig` are immutable —
 * changing either replaces the store. `description` is updated in place.
 * ### Creating a Variant Store
 * **Example:** Basic Variant Store
 * ```typescript
 * import * as Omics from "alchemy/AWS/Omics";
 *
 * const store = yield* Omics.VariantStore("Variants", {
 *   reference: {
 *     referenceArn: "arn:aws:omics:us-east-1:123456789012:referenceStore/1234567890/reference/0987654321",
 *   },
 * });
 * ```
 *
 * @resource
 */
export const VariantStore = Resource("AWS.Omics.VariantStore");
export const VariantStoreProvider = () => Provider.effect(VariantStore, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.name ??
            toStoreName(yield* createPhysicalName({ id, maxLength: 96 })));
    });
    const waitUntilActive = Effect.fn(function* (name) {
        const final = yield* omics.getVariantStore({ name }).pipe(Effect.repeat({
            schedule: Schedule.max([
                Schedule.fixed("5 seconds"),
                Schedule.recurs(23),
            ]),
            until: (s) => s.status === "ACTIVE" || s.status === "FAILED",
        }));
        if (final.status === "FAILED") {
            return yield* Effect.fail(new omics.ValidationException({
                message: `Variant store ${name} failed: ${final.statusMessage ?? "unknown"}`,
            }));
        }
        return final;
    });
    return VariantStore.Provider.of({
        stables: ["variantStoreId", "variantStoreArn", "name"],
        list: () => omics.listVariantStores.items({}).pipe(Stream.map((item) => ({
            variantStoreId: item.id,
            variantStoreArn: item.storeArn,
            name: item.name ?? "",
            status: item.status ?? "",
        })), Stream.runCollect, Effect.map((chunk) => Array.from(chunk))),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.name ?? (yield* createName(id, olds ?? {}));
            const found = yield* omics
                .getVariantStore({ name })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            if (found === undefined)
                return undefined;
            const attrs = {
                variantStoreId: found.id,
                variantStoreArn: found.storeArn,
                name: found.name,
                status: found.status,
            };
            return (yield* hasAlchemyTags(id, tagRecord(found.tags)))
                ? attrs
                : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const prev = olds ?? {};
            const oldName = yield* createName(id, prev);
            const newName = yield* createName(id, news);
            if (oldName !== newName)
                return { action: "replace" };
            if ((prev.reference?.referenceArn ?? "") !==
                (news.reference?.referenceArn ?? "") ||
                prev.sseConfig?.type !== news.sseConfig?.type ||
                prev.sseConfig?.keyArn !== news.sseConfig?.keyArn) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.name ?? (yield* createName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            let store = yield* omics
                .getVariantStore({ name })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            if (store === undefined) {
                yield* omics
                    .createVariantStore({
                    name,
                    description: news.description,
                    reference: news.reference,
                    sseConfig: news.sseConfig,
                    tags: desiredTags,
                })
                    .pipe(Effect.catchTag("ConflictException", () => Effect.void));
                store = yield* waitUntilActive(name);
            }
            else if (store.status === "CREATING") {
                store = yield* waitUntilActive(name);
            }
            if (news.description !== undefined &&
                news.description !== store.description) {
                yield* omics.updateVariantStore({
                    name,
                    description: news.description,
                });
                store = yield* omics.getVariantStore({ name });
            }
            yield* syncOmicsTags(store.storeArn, desiredTags);
            yield* session.note(store.id);
            return {
                variantStoreId: store.id,
                variantStoreArn: store.storeArn,
                name: store.name,
                status: store.status,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* omics
                .deleteVariantStore({ name: output.name, force: true })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=VariantStore.js.map