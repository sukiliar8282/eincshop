import * as vectorize from "@distilled.cloud/cloudflare/vectorize";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { isResourceOfType, Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.VectorizeIndex";
const DEFAULT_METRIC = "cosine";
/**
 * A Cloudflare Vectorize index for storing and querying vector embeddings.
 *
 * Vectorize is a globally distributed vector database. Create an index as a
 * resource, then bind it to a Worker to insert, upsert, and query vectors.
 *
 * A Vectorize index is identified by its name and is immutable: its
 * dimensions, metric, preset, and description are all fixed at creation.
 * Changing any of them triggers a replacement.
 * ### Creating an Index
 * **Example:** Index with explicit dimensions and metric
 * ```typescript
 * const index = yield* Cloudflare.Vectorize.Index("my-index", {
 *   dimensions: 768,
 *   metric: "cosine",
 * });
 * ```
 *
 * **Example:** Index from a managed embedding model preset
 * A preset fixes the dimensions and metric to match the named model.
 * ```typescript
 * const index = yield* Cloudflare.Vectorize.Index("my-index", {
 *   preset: "@cf/baai/bge-base-en-v1.5",
 * });
 * ```
 *
 * **Example:** Index with a description
 * ```typescript
 * const index = yield* Cloudflare.Vectorize.Index("my-index", {
 *   dimensions: 1536,
 *   metric: "euclidean",
 *   description: "Product catalog embeddings",
 * });
 * ```
 *
 * ### Binding to a Worker
 * **Example:** Querying an index inside a Worker
 * ```typescript
 * const index = yield* Cloudflare.Vectorize.SearchIndex(MyIndex);
 *
 * // Insert vectors
 * yield* index.upsert([
 *   { id: "1", values: [0.1, 0.2, 0.3], metadata: { title: "doc" } },
 * ]);
 *
 * // Query the nearest neighbors
 * const matches = yield* index.query([0.1, 0.2, 0.3], { topK: 5 });
 * ```
 *
 * @see https://developers.cloudflare.com/vectorize/
 *
 * @resource
 * @product Vectorize
 * @category AI
 */
export const Index = Resource(TypeId);
/**
 * Returns true if the given value is a Vectorize Index resource.
 */
export const isIndex = (value) => isResourceOfType(value, TypeId);
export const IndexProvider = () => Provider.succeed(Index, {
    stables: ["indexName", "accountId"],
    diff: Effect.fn(function* ({ id, olds = {}, news = {}, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        if (!isResolved(news))
            return undefined;
        if ((output?.accountId ?? accountId) !== accountId) {
            return { action: "replace" };
        }
        const oldName = output?.indexName ?? (yield* createIndexName(id, olds.name));
        // Auto-generated names are engine-owned: the deployed name stays
        // authoritative even if the generator would name this id differently
        // today. Only an explicit user-provided name can force a replace.
        const name = news.name ?? oldName;
        if (oldName !== name ||
            (news.preset ?? undefined) !== (olds.preset ?? undefined) ||
            (news.dimensions ?? undefined) !== (olds.dimensions ?? undefined) ||
            (news.metric ?? DEFAULT_METRIC) !== (olds.metric ?? DEFAULT_METRIC) ||
            (news.description ?? undefined) !== (olds.description ?? undefined)) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        const name = output?.indexName ?? (yield* createIndexName(id, olds?.name));
        return yield* vectorize
            .getIndex({ accountId: acct, indexName: name })
            .pipe(Effect.map((index) => toAttributes(index, name, acct)), Effect.catchTag(["NotFound", "Gone"], () => Effect.succeed(undefined)));
    }),
    reconcile: Effect.fn(function* ({ id, news = {}, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Prefer the deployed name: regenerating would target a different
        // index if the generator's output for this id ever drifts.
        const indexName = output?.indexName ?? (yield* createIndexName(id, news.name));
        // Observe — read the live index by name. The name is the stable
        // identifier; fall back through a NotFound to the create path so
        // we recover from out-of-band deletes or partial state-persistence.
        let observed = yield* vectorize
            .getIndex({
            accountId,
            indexName,
        })
            .pipe(Effect.catchTag(["NotFound", "Gone"], () => Effect.succeed(undefined)));
        // Ensure — create if missing. Cloudflare returns 409 Conflict when
        // an index with the same name already exists; tolerate the race by
        // re-reading it.
        if (!observed) {
            observed = yield* vectorize
                .createIndex({
                accountId,
                name: indexName,
                config: buildConfig(news),
                description: news.description,
            })
                .pipe(Effect.catchTag("IndexAlreadyExists", () => vectorize.getIndex({ accountId, indexName })));
        }
        return toAttributes(observed, indexName, accountId);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* vectorize
            .deleteIndex({
            accountId: output.accountId,
            indexName: output.indexName,
        })
            .pipe(Effect.catchTag(["NotFound", "Gone"], () => Effect.void));
    }),
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* vectorize.listIndexes.pages({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? [])
            .filter((index) => index.name != null)
            .map((index) => toAttributes(index, index.name, accountId)))));
    }),
});
const toAttributes = (index, name, accountId) => ({
    indexName: index.name ?? name,
    dimensions: index.config?.dimensions,
    // Distilled widened generated string enums to open unions (`string & {}`).
    metric: index.config?.metric,
    description: index.description ?? undefined,
    accountId,
    createdOn: index.createdOn ?? undefined,
    modifiedOn: index.modifiedOn ?? undefined,
});
const createIndexName = (id, name) => Effect.gen(function* () {
    return name ?? (yield* createPhysicalName({ id, lowercase: true }));
});
const buildConfig = (news) => news.preset !== undefined
    ? // `Preset` is intentionally open (`| (string & {})`) so
        // new Cloudflare presets aren't blocked by stale types. The
        // distilled type is the strict-at-release-time union; cast
        // through for the API call.
        {
            preset: news.preset,
        }
    : {
        dimensions: news.dimensions,
        metric: news.metric ?? DEFAULT_METRIC,
    };
//# sourceMappingURL=VectorizeIndex.js.map