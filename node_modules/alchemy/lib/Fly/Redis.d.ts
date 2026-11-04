import type { AddOnPlansResponseEdgesItemNode, AddOnsResponseEdgesItemNode } from "@distilled.cloud/fly-io/addons";
import * as addons from "@distilled.cloud/fly-io/addons";
import * as Effect from "effect/Effect";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Providers } from "./Providers.ts";
export declare const DEFAULT_REDIS_REGION = "iad";
export declare const REDIS_ADDON_TYPE = "upstash_redis";
export declare const REDIS_PROVIDER = "upstash_redis";
export declare const REDIS_URL_ENV = "REDIS_URL";
export { CommandError as RedisCommandError, UrlMissing as RedisUrlMissing, } from "../Redis/index.ts";
export interface RedisProps {
    /**
     * Upstash Redis database name. Globally unique in the org. If omitted,
     * a unique name is generated from the stack, stage and logical ID.
     * Changing it replaces the database.
     */
    name?: string;
    /**
     * Primary region (`iad`, `ord`, `sjc`, …). Fly cannot move a primary.
     * Changing it replaces the database.
     *
     * @default "iad"
     */
    primaryRegion?: string;
    /**
     * Organization slug. Defaults to the current token's org. Changing it
     * replaces the database.
     */
    orgSlug?: string;
    /**
     * Add-on plan id, name, or display name from `addOnPlans`. Default is
     * the cheapest listed plan (free or pay-as-you-go). Fixed plans are
     * billed. Default tests use the cheapest listed plan.
     */
    plan?: string;
    /**
     * Read-replica regions. Updated in place. Must not include the
     * primary region.
     */
    readRegions?: string[];
    /**
     * Evict keys when memory is full (cache workload). Updated in place.
     */
    eviction?: boolean;
    /**
     * Automatically upgrade a fixed plan when hitting resource limits.
     * Ignored on pay-as-you-go.
     */
    autoUpgrade?: boolean;
    /**
     * ProdPack add-on ($200/mo). Paid. Not enabled in default tests.
     */
    prodPack?: boolean;
}
export type Redis = Resource<"Fly.Redis", RedisProps, {
    /** Fly GraphQL add-on id. */
    redisId: string;
    /** Physical Upstash Redis name. */
    name: string;
    /** Primary region code. */
    primaryRegion: string;
    /** Observed read-replica regions. */
    readRegions: string[];
    /** Observed status (`ready`, `provisioning`, …). */
    status: string | undefined;
    /** Selected plan id, if the API returned one. */
    planId: string | undefined;
    /** Observed plan name (`Pay-as-you-go`, `Fixed 250MB`, …). */
    planName: string | undefined;
    /** Private 6PN address, if the API returned one. */
    privateIp: string | undefined;
    /** Organization slug. */
    orgSlug: string | undefined;
    /** Whether eviction is enabled. */
    eviction: boolean | undefined;
}, never, Providers>;
/**
 * Managed Upstash Redis in a Fly org. Bind {@link ReadRedis},
 * {@link WriteRedis}, or {@link ReadWriteRedis} on a {@link Service}.
 * Alchemy writes `REDIS_URL` as an App secret and the runtime client
 * uses it internally. Redis is not reachable from CI — drive it over
 * HTTP.
 *
 * @see https://fly.io/docs/upstash/redis/
 *
 * ### Create Redis
 * Alchemy generates a unique name unless you pass one. Default region is
 * `iad`. Default plan is the cheapest `addOnPlans` row (free or
 * pay-as-you-go).
 *
 * **Example:** Generated name
 * ```typescript
 * const cache = yield* Fly.Redis("Cache");
 * ```
 *
 * :::note
 * Prefer omitting `name` in tests and CI so names stay unique and
 * reclaimable.
 * :::
 *
 * ### A stable name
 * Pass `name` when you want a stable Upstash database name.
 *
 * **Example:** Explicit name
 * ```typescript
 * const cache = yield* Fly.Redis("Cache", {
 *   name: "my-cache",
 *   primaryRegion: "iad",
 * });
 * ```
 *
 * :::caution[Changing `name` replaces Redis]
 * Fly cannot rename an add-on. Alchemy deletes the old database first,
 * then creates the new one.
 * :::
 *
 * :::caution[Changing `primaryRegion` replaces Redis]
 * The primary region is immutable. The old database is deleted first
 * because the name cannot exist twice.
 * :::
 *
 * ### Bind from a Service
 * Yield {@link ReadWriteRedis} (or {@link ReadRedis} / {@link WriteRedis})
 * in Service init. Provide the matching `*Http` layer.
 *
 * **Example:** Read and write
 * ```typescript
 * import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
 *
 * const Cache = Fly.Redis("Cache");
 *
 * export default class Api extends Fly.Service<Api>()(
 *   "Api",
 *   { app: Site, main: import.meta.url, port: 3000 },
 *   Effect.gen(function* () {
 *     const cache = yield* Fly.ReadWriteRedis(Cache);
 *     return {
 *       fetch: Effect.gen(function* () {
 *         yield* cache.set("marker", "hello");
 *         const value = yield* cache.get("marker");
 *         return HttpServerResponse.json({ value });
 *       }),
 *     };
 *   }).pipe(Effect.provide(Fly.ReadWriteRedisHttp)),
 * ) {}
 * ```
 *
 * ### Eviction
 * Enable eviction for cache workloads. Updated in place.
 *
 * **Example:** Eviction
 * ```typescript
 * const cache = yield* Fly.Redis("Cache", {
 *   eviction: true,
 * });
 * ```
 *
 * ### Read replicas
 * `readRegions` are extra replica regions. Updated in place.
 *
 * **Example:** Replica region
 * ```typescript
 * const cache = yield* Fly.Redis("Cache", {
 *   primaryRegion: "iad",
 *   readRegions: ["sjc"],
 * });
 * ```
 *
 * ### Plan
 * Omit `plan` for the cheapest listed plan. Pass a plan id or display
 * name to pin one. Fixed plans are billed.
 *
 * **Example:** Pin pay-as-you-go
 * ```typescript
 * const cache = yield* Fly.Redis("Cache", {
 *   plan: "Pay-as-you-go",
 * });
 * ```
 *
 * :::caution[Fixed plans are billed]
 * Fixed plans are billed monthly. Prefer omitting `plan` unless you
 * need a specific size.
 * :::
 *
 * @resource
 */
export declare const Redis: import("../Resource.ts").ResourceClass<Redis>;
declare const RedisNotCreated_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.RedisNotCreated";
} & Readonly<A>;
export declare class RedisNotCreated extends RedisNotCreated_base<{
    name: string;
    errorMessage?: string;
}> {
}
declare const RedisPlanNotFound_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.RedisPlanNotFound";
} & Readonly<A>;
export declare class RedisPlanNotFound extends RedisPlanNotFound_base<{
    plan: string;
}> {
}
declare const RedisOrgMissing_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.RedisOrgMissing";
} & Readonly<A>;
export declare class RedisOrgMissing extends RedisOrgMissing_base<{
    orgSlug: string;
}> {
}
type RedisPlan = AddOnPlansResponseEdgesItemNode;
export declare const isFixedRedisPlan: (plan: Pick<RedisPlan, "name" | "displayName">) => boolean;
export declare const listRedisAddOns: () => Effect.Effect<AddOnsResponseEdgesItemNode[], addons.FlyIoOpError, addons.FlyIoOpContext>;
export declare const listRedisPlans: () => Effect.Effect<addons.AddOnResponseAddOnPlan[], addons.FlyIoOpError, addons.FlyIoOpContext>;
export declare const findRedisAddOn: (input: {
    id?: string;
    name?: string;
}) => Effect.Effect<AddOnsResponseEdgesItemNode | undefined, addons.FlyIoOpError, addons.FlyIoOpContext>;
/**
 * Write `REDIS_URL` onto an App from attached Redis add-on names.
 * Called from {@link Service} reconcile so the secret exists before
 * Machines boot.
 */
export declare const attachRedisSecrets: (appName: string, attached: readonly {
    name: string;
    id?: string;
}[]) => Effect.Effect<void, import("@distilled.cloud/fly-io").BadRequest | import("@distilled.cloud/fly-io").Forbidden | import("@distilled.cloud/fly-io").NotFound | addons.FlyIoOpError, addons.FlyIoOpContext>;
export declare const RedisProvider: () => import("effect/Layer").Layer<Provider.Provider<Redis>, never, import("../Stack.ts").Stack | import("../Stage.ts").Stage | addons.FlyIoOpContext>;
//# sourceMappingURL=Redis.d.ts.map