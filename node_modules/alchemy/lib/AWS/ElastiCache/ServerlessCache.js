import * as elasticache from "@distilled.cloud/aws/elasticache";
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
 * An Amazon ElastiCache serverless cache (valkey, redis, or memcached).
 *
 * Serverless caches scale storage and compute automatically and are only
 * reachable from inside a VPC. They are metered while they exist (with a
 * monthly minimum), so set `cacheUsageLimits` and destroy caches you are
 * not using.
 * ### Creating a Serverless Cache
 * **Example:** Valkey Cache with Cost-Control Limits
 * ```typescript
 * const cache = yield* ServerlessCache("SessionCache", {
 *   engine: "valkey",
 *   cacheUsageLimits: {
 *     dataStorage: { maximum: 1 },
 *     ecpuPerSecond: { maximum: 1000 },
 *   },
 * });
 * ```
 *
 * **Example:** Redis Cache in Specific Subnets
 * ```typescript
 * const cache = yield* ServerlessCache("Cache", {
 *   engine: "redis",
 *   majorEngineVersion: "7",
 *   subnetIds: [subnetA.subnetId, subnetB.subnetId],
 *   securityGroupIds: [cacheSecurityGroup.securityGroupId],
 * });
 * ```
 *
 * ### Connecting from a Lambda Function
 * **Example:** Bind Connection Info into a Function
 * ```typescript
 * const connect = yield* ElastiCache.Connect(cache);
 * // inside a handler:
 * const { host, port, tls } = yield* connect;
 * ```
 *
 * @resource
 */
export const ServerlessCache = Resource("AWS.ElastiCache.ServerlessCache");
const toTagRecord = (tags) => Object.fromEntries((tags ?? [])
    .filter((tag) => typeof tag.Key === "string" && typeof tag.Value === "string")
    .map((tag) => [tag.Key, tag.Value]));
const sameStringSet = (a, b) => {
    const left = [...(a ?? [])].sort();
    const right = [...(b ?? [])].sort();
    return left.length === right.length && left.every((v, i) => v === right[i]);
};
/**
 * Convert user-facing camelCase usage limits into the wire shape. Serverless
 * data storage is always expressed in GB.
 */
const toWireUsageLimits = (limits) => limits === undefined
    ? undefined
    : {
        ...(limits.dataStorage
            ? {
                DataStorage: {
                    Maximum: limits.dataStorage.maximum,
                    Minimum: limits.dataStorage.minimum,
                    Unit: "GB",
                },
            }
            : {}),
        ...(limits.ecpuPerSecond
            ? {
                ECPUPerSecond: {
                    Maximum: limits.ecpuPerSecond.maximum,
                    Minimum: limits.ecpuPerSecond.minimum,
                },
            }
            : {}),
    };
/**
 * True when the desired usage limits differ from the observed ones for any
 * field the user actually specified.
 */
const usageLimitsDiffer = (desired, observed) => {
    if (desired === undefined)
        return false;
    // Only compare fields the user actually specified — the service fills in
    // defaults (units, minimums) that must not trigger spurious modify calls.
    if (desired.DataStorage) {
        if ((desired.DataStorage.Maximum !== undefined &&
            desired.DataStorage.Maximum !== observed?.DataStorage?.Maximum) ||
            (desired.DataStorage.Minimum !== undefined &&
                desired.DataStorage.Minimum !== observed?.DataStorage?.Minimum)) {
            return true;
        }
    }
    if (desired.ECPUPerSecond) {
        if ((desired.ECPUPerSecond.Maximum !== undefined &&
            desired.ECPUPerSecond.Maximum !== observed?.ECPUPerSecond?.Maximum) ||
            (desired.ECPUPerSecond.Minimum !== undefined &&
                desired.ECPUPerSecond.Minimum !== observed?.ECPUPerSecond?.Minimum)) {
            return true;
        }
    }
    return false;
};
export const ServerlessCacheProvider = () => Provider.effect(ServerlessCache, Effect.gen(function* () {
    const toName = (id, props) => props.serverlessCacheName
        ? Effect.succeed(props.serverlessCacheName)
        : createPhysicalName({ id, maxLength: 40, lowercase: true });
    const readCache = Effect.fn(function* (name) {
        const response = yield* elasticache
            .describeServerlessCaches({ ServerlessCacheName: name })
            .pipe(Effect.catchTag("ServerlessCacheNotFoundFault", () => Effect.succeed(undefined)));
        return response?.ServerlessCaches?.[0];
    });
    const readTags = Effect.fn(function* (arn) {
        const response = yield* elasticache
            .listTagsForResource({ ResourceName: arn })
            .pipe(Effect.catch(() => Effect.succeed(undefined)));
        return toTagRecord(response?.TagList);
    });
    // Bounded readiness wait. Serverless cache provisioning/modification
    // typically completes in 1-3 minutes; budget ~10 min (60 * 10s) like
    // the RDS cluster wait so slow regions still converge.
    const waitForCache = Effect.fn(function* (name) {
        const readinessPolicy = Schedule.max([
            Schedule.fixed("10 seconds"),
            Schedule.recurs(60),
        ]);
        return yield* readCache(name).pipe(Effect.flatMap((cache) => {
            if (!cache?.ARN) {
                return Effect.fail(new Error(`Serverless cache '${name}' not found`));
            }
            if (cache.Status !== "available") {
                return Effect.fail(new Error(`Serverless cache '${name}' not available (status: ${cache.Status})`));
            }
            return Effect.succeed(cache);
        }), Effect.retry({ schedule: readinessPolicy }));
    });
    // Wait for a cache to leave a transitional state before delete. Ends
    // when the cache is available, deleting, or gone.
    const waitUntilSettled = Effect.fn(function* (name) {
        const settlePolicy = Schedule.max([
            Schedule.fixed("10 seconds"),
            Schedule.recurs(60),
        ]);
        return yield* readCache(name).pipe(Effect.flatMap((cache) => {
            if (cache !== undefined &&
                cache.Status !== "available" &&
                cache.Status !== "deleting") {
                return Effect.fail(new Error(`Serverless cache '${name}' still settling (status: ${cache.Status})`));
            }
            return Effect.succeed(cache);
        }), Effect.retry({ schedule: settlePolicy }));
    });
    const toAttrs = Effect.fn(function* (cache) {
        if (!cache.ServerlessCacheName ||
            !cache.ARN ||
            !cache.Endpoint?.Address ||
            cache.Endpoint.Port === undefined) {
            return yield* Effect.fail(new Error(`Serverless cache '${cache.ServerlessCacheName}' is missing its ARN or endpoint (status: ${cache.Status})`));
        }
        return {
            serverlessCacheName: cache.ServerlessCacheName,
            serverlessCacheArn: cache.ARN,
            status: cache.Status ?? "available",
            engine: cache.Engine ?? "valkey",
            majorEngineVersion: cache.MajorEngineVersion,
            fullEngineVersion: cache.FullEngineVersion,
            endpointAddress: cache.Endpoint.Address,
            endpointPort: cache.Endpoint.Port,
            readerEndpointAddress: cache.ReaderEndpoint?.Address,
            readerEndpointPort: cache.ReaderEndpoint?.Port,
            securityGroupIds: [...(cache.SecurityGroupIds ?? [])],
            subnetIds: [...(cache.SubnetIds ?? [])],
            tags: yield* readTags(cache.ARN),
        };
    });
    return {
        stables: ["serverlessCacheName", "serverlessCacheArn"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            if ((yield* toName(id, olds ?? {})) !== (yield* toName(id, news ?? {}))) {
                return { action: "replace" };
            }
            // Create-only properties force a replacement.
            if (news?.subnetIds !== undefined &&
                olds?.subnetIds !== undefined &&
                !sameStringSet(news.subnetIds, olds.subnetIds)) {
                return { action: "replace" };
            }
            if ((news?.kmsKeyId ?? undefined) !== (olds?.kmsKeyId ?? undefined)) {
                return { action: "replace" };
            }
            if ((news?.networkType ?? undefined) !==
                (olds?.networkType ?? undefined)) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.serverlessCacheName ?? (yield* toName(id, olds ?? {}));
            const cache = yield* readCache(name);
            // A cache that is still provisioning has no endpoint yet; report
            // it as missing so reconcile (which tolerates the AlreadyExists
            // race and waits for availability) converges it.
            if (!cache?.ARN ||
                !cache.Endpoint?.Address ||
                cache.Endpoint.Port === undefined) {
                return undefined;
            }
            const attrs = yield* toAttrs(cache);
            return (yield* hasAlchemyTags(id, attrs.tags))
                ? attrs
                : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news = {}, output, session }) {
            const name = output?.serverlessCacheName ?? (yield* toName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            const desiredLimits = toWireUsageLimits(news.cacheUsageLimits);
            // 1. Observe — cloud state is authoritative.
            let observed = yield* readCache(name);
            // 2. Ensure — create if missing; tolerate AlreadyExists as a race.
            if (observed === undefined) {
                yield* elasticache
                    .createServerlessCache({
                    ServerlessCacheName: name,
                    Engine: news.engine ?? "valkey",
                    MajorEngineVersion: news.majorEngineVersion,
                    Description: news.description,
                    CacheUsageLimits: desiredLimits,
                    KmsKeyId: news.kmsKeyId,
                    SecurityGroupIds: news.securityGroupIds,
                    SubnetIds: news.subnetIds,
                    UserGroupId: news.userGroupId,
                    SnapshotRetentionLimit: news.snapshotRetentionLimit,
                    DailySnapshotTime: news.dailySnapshotTime,
                    NetworkType: news.networkType,
                    SnapshotArnsToRestore: news.snapshotArnsToRestore,
                    Tags: Object.entries(desiredTags).map(([Key, Value]) => ({
                        Key,
                        Value,
                    })),
                })
                    .pipe(Effect.catchTag("ServerlessCacheAlreadyExistsFault", () => Effect.void));
            }
            // Provisioning and in-flight modifications both surface as a
            // non-available status; wait for the cache to become available
            // (bounded) so sync/modify calls do not hit
            // InvalidServerlessCacheStateFault.
            observed = yield* waitForCache(name);
            // 3. Sync — compute the modify delta from OBSERVED state.
            const modify = {};
            if (news.description !== undefined &&
                news.description !== observed.Description) {
                modify.Description = news.description;
            }
            if (usageLimitsDiffer(desiredLimits, observed.CacheUsageLimits)) {
                modify.CacheUsageLimits = desiredLimits;
            }
            if (news.securityGroupIds !== undefined &&
                !sameStringSet(news.securityGroupIds, observed.SecurityGroupIds)) {
                modify.SecurityGroupIds = news.securityGroupIds;
            }
            if (news.userGroupId !== undefined &&
                news.userGroupId !== observed.UserGroupId) {
                modify.UserGroupId = news.userGroupId;
            }
            else if (news.userGroupId === undefined &&
                observed.UserGroupId !== undefined) {
                modify.RemoveUserGroup = true;
            }
            if (news.snapshotRetentionLimit !== undefined &&
                news.snapshotRetentionLimit !==
                    (observed.SnapshotRetentionLimit ?? 0)) {
                modify.SnapshotRetentionLimit = news.snapshotRetentionLimit;
            }
            if (news.dailySnapshotTime !== undefined &&
                news.dailySnapshotTime !== observed.DailySnapshotTime) {
                modify.DailySnapshotTime = news.dailySnapshotTime;
            }
            if (news.engine !== undefined && news.engine !== observed.Engine) {
                // valkey <-> redis upgrades are supported in-place by the API.
                modify.Engine = news.engine;
                if (news.majorEngineVersion !== undefined) {
                    modify.MajorEngineVersion = news.majorEngineVersion;
                }
            }
            else if (news.majorEngineVersion !== undefined &&
                news.majorEngineVersion !== observed.MajorEngineVersion) {
                modify.MajorEngineVersion = news.majorEngineVersion;
            }
            if (Object.keys(modify).length > 0) {
                yield* elasticache.modifyServerlessCache({
                    ServerlessCacheName: name,
                    ...modify,
                });
                observed = yield* waitForCache(name);
            }
            // 3b. Sync tags — diff against OBSERVED cloud tags.
            const arn = observed.ARN;
            if (arn) {
                const observedTags = yield* readTags(arn);
                const { removed, upsert } = diffTags(observedTags, desiredTags);
                if (upsert.length > 0) {
                    yield* elasticache.addTagsToResource({
                        ResourceName: arn,
                        Tags: upsert,
                    });
                }
                if (removed.length > 0) {
                    yield* elasticache.removeTagsFromResource({
                        ResourceName: arn,
                        TagKeys: removed,
                    });
                }
            }
            // 4. Return fresh attributes.
            yield* session.note(name);
            return yield* toAttrs(observed);
        }),
        delete: Effect.fn(function* ({ output }) {
            const name = output.serverlessCacheName;
            // A cache mid-create/modify rejects deletion with
            // InvalidServerlessCacheStateFault — wait (bounded) for it to
            // settle first. A cache already deleting (or gone) is success.
            yield* waitUntilSettled(name);
            yield* elasticache
                .deleteServerlessCache({ ServerlessCacheName: name })
                .pipe(Effect.catchTag("ServerlessCacheNotFoundFault", () => Effect.void), Effect.catchTag("InvalidServerlessCacheStateFault", () => 
            // Already deleting — deletion is in progress.
            Effect.void));
        }),
        list: () => elasticache.describeServerlessCaches.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.ServerlessCaches ?? []).filter((cache) => cache.ServerlessCacheName !== undefined &&
            cache.ARN !== undefined &&
            cache.Endpoint?.Address !== undefined &&
            cache.Endpoint.Port !== undefined))), Effect.flatMap(Effect.forEach((cache) => toAttrs(cache), { concurrency: 4 }))),
    };
}));
//# sourceMappingURL=ServerlessCache.js.map