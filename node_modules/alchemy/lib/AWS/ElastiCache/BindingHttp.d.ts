import * as Effect from "effect/Effect";
import type { ServerlessCache } from "./ServerlessCache.ts";
/**
 * Shared scaffolding for AWS ElastiCache HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the builders
 * below. Everything except the operation and the IAM action list is
 * boilerplate. The env-only `ConnectHttp` binding stays bespoke — it attaches
 * environment variables instead of IAM policy.
 */
/**
 * Serverless cache snapshot ARNs embed the snapshot name, which is runtime
 * data for every snapshot-addressed operation, so snapshot-scoped grants use
 * this wildcard.
 */
export declare const SERVERLESS_SNAPSHOT_ARN_WILDCARD = "arn:aws:elasticache:*:*:serverlesscachesnapshot:*";
/**
 * Build the impl Effect for an account-level operation (snapshot management,
 * cache/event monitoring). The deploy-time half grants `actions` on
 * `resources` (default `*`) — these operations address caches and snapshots
 * by names that are runtime data.
 */
export declare const makeElastiCacheAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.ElastiCache.DescribeEvents`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted. */
    actions: readonly string[];
    /**
     * IAM resources the actions are granted on.
     * @default ["*"]
     */
    resources?: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a cache-scoped operation: the runtime callable
 * injects the bound {@link ServerlessCache}'s name as `ServerlessCacheName`
 * and the deploy-time half grants `actions` on the cache ARN (plus any
 * `extraResources`).
 */
export declare const makeElastiCacheCacheHttpBinding: <I extends {
    ServerlessCacheName: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.ElastiCache.CreateServerlessCacheSnapshot`. */
    tag: string;
    /** The distilled operation; `ServerlessCacheName` is injected from the cache. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the cache ARN. */
    actions: readonly string[];
    /** Static IAM resources granted in addition to the cache ARN. */
    extraResources?: readonly string[];
}) => Effect.Effect<(cache: ServerlessCache) => Effect.Effect<(request?: Omit<I, "ServerlessCacheName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map