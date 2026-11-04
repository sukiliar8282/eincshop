import * as kvs from "@distilled.cloud/aws/cloudfront-keyvaluestore";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { extractValue, getKvsEtag, isKvsPreconditionFailed, cappedKvsRetrySchedule, retryForKvsReadiness, withKvsRegionFn, } from "./common.js";
/**
 * Manages namespaced key-value entries in a CloudFront KeyValueStore.
 *
 * Entries are stored with a `{namespace}:{key}` prefix to allow multiple
 * logical groups within a single store. Updates use batched optimistic
 * concurrency with automatic ETag retry.
 * ### Managing Entries
 * **Example:** Basic Entries
 * ```typescript
 * const entries = yield* KvEntries("Routes", {
 *   store: store.keyValueStoreArn,
 *   namespace: "routes",
 *   entries: {
 *     "/": "/index.html",
 *     "/about": "/about.html",
 *   },
 * });
 * ```
 *
 * **Example:** Purge Stale Keys
 * ```typescript
 * const entries = yield* KvEntries("Routes", {
 *   store: store.keyValueStoreArn,
 *   namespace: "routes",
 *   entries: { "/": "/index.html" },
 *   purge: true,
 * });
 * ```
 *
 * @resource
 */
export const KvEntries = Resource("AWS.CloudFront.KvEntries");
const BATCH_SIZE = 50;
const resolveEntries = (entries) => Object.fromEntries(Object.entries(entries).map(([key, value]) => [key, value]));
export const KvEntriesProvider = () => Provider.effect(KvEntries, 
// @ts-expect-error
Effect.gen(function* () {
    const collectAllKeys = Effect.fn(function* (store) {
        const keys = [];
        let nextToken;
        do {
            const resp = yield* kvs.listKeys({
                KvsARN: store,
                NextToken: nextToken,
            });
            for (const item of resp.Items ?? []) {
                keys.push({
                    Key: item.Key,
                    Value: extractValue(item.Value),
                });
            }
            nextToken = resp.NextToken;
        } while (nextToken);
        return keys;
    });
    const sendBatch = Effect.fn(function* (store, etag, puts, deletes) {
        return yield* kvs.updateKeys({
            KvsARN: store,
            IfMatch: etag,
            Puts: puts.length > 0 ? puts : undefined,
            Deletes: deletes.length > 0 ? deletes : undefined,
        });
    });
    const batchUpdateKeys = Effect.fn(function* (store, etag, puts, deletes) {
        let remainingPuts = puts;
        let remainingDeletes = deletes;
        let currentEtag = etag;
        while (remainingPuts.length > 0 || remainingDeletes.length > 0) {
            const batchPuts = remainingPuts.slice(0, BATCH_SIZE);
            const batchDeletes = remainingDeletes.slice(0, BATCH_SIZE - batchPuts.length);
            // A precondition failure means a concurrent writer (another
            // KvEntries / KvRoutesUpdate on the same store) advanced the
            // etag between our read and this batch — the retry MUST re-read
            // the etag or it can never succeed. `stale` drops the cached
            // etag on the failed attempt so the retried generator fetches a
            // fresh one.
            let stale = currentEtag;
            const resp = yield* Effect.gen(function* () {
                const attemptEtag = stale ?? (yield* getKvsEtag(store));
                stale = undefined;
                return yield* sendBatch(store, attemptEtag, batchPuts, batchDeletes);
            }).pipe(Effect.retry({
                while: (error) => error._tag === "ValidationException" &&
                    isKvsPreconditionFailed(error),
                schedule: cappedKvsRetrySchedule,
            }));
            currentEtag = resp.ETag;
            remainingPuts = remainingPuts.slice(batchPuts.length);
            remainingDeletes = remainingDeletes.slice(batchDeletes.length);
        }
    });
    const upload = Effect.fn(function* (store, namespace, entries, oldEntries) {
        const puts = [];
        for (const [key, value] of Object.entries(entries)) {
            if (oldEntries === undefined || oldEntries[key] !== value) {
                puts.push({ Key: `${namespace}:${key}`, Value: value });
            }
        }
        if (puts.length > 0) {
            yield* batchUpdateKeys(store, undefined, puts, []);
        }
    });
    const purge = Effect.fn(function* (store, namespace, keepEntries) {
        const allKeys = yield* collectAllKeys(store);
        const prefix = `${namespace}:`;
        const deletes = [];
        for (const item of allKeys) {
            if (!item.Key.startsWith(prefix))
                continue;
            const unprefixed = item.Key.slice(prefix.length);
            if (keepEntries && unprefixed in keepEntries)
                continue;
            deletes.push({ Key: item.Key });
        }
        if (deletes.length > 0) {
            yield* batchUpdateKeys(store, undefined, [], deletes);
        }
    });
    return {
        // Non-listable: a KvEntries resource is a logical group of key/value
        // data keyed entirely by its parent store ARN + namespace (both chosen
        // by the user). There is no account-wide API to enumerate these groups,
        // and the entries are managed content rather than nuke-able infra.
        list: () => Effect.succeed([]),
        read: withKvsRegionFn(Effect.fn(function* ({ output }) {
            return output;
        })),
        reconcile: withKvsRegionFn(Effect.fn(function* ({ news, output }) {
            return yield* retryForKvsReadiness(Effect.gen(function* () {
                const entries = resolveEntries(news.entries);
                // Observe — diff against the prior persisted entries so
                // we only `Put` keys whose values actually changed. When
                // the store identity changes (or there's no prior
                // output), treat every key as new.
                const priorEntries = output && output.store === news.store
                    ? resolveEntries(output.entries)
                    : undefined;
                // Sync entries — push the changed keys.
                yield* upload(news.store, news.namespace, entries, priorEntries);
                // Sync stale keys — when `purge` is set, list every key
                // under the namespace and delete anything not in the
                // desired set. This converges adopted/drifted state.
                if (news.purge) {
                    yield* purge(news.store, news.namespace, entries);
                }
                return {
                    store: news.store,
                    namespace: news.namespace,
                    entries,
                };
            }));
        })),
        delete: withKvsRegionFn(Effect.fn(function* ({ output }) {
            if (!output.store)
                return;
            yield* retryForKvsReadiness(purge(output.store, output.namespace, undefined)).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        })),
    };
}));
//# sourceMappingURL=KvEntries.js.map