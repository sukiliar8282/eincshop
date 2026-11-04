import * as sesv2 from "@distilled.cloud/aws/sesv2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * The pool's scaling mode. `STANDARD` pools use a fixed set of dedicated IPs
 * you request and warm up yourself; `MANAGED` pools let SES automatically
 * scale the dedicated IP capacity for you.
 */
export type DedicatedIpPoolScalingMode = sesv2.ScalingMode;
export interface DedicatedIpPoolProps {
    /**
     * Name of the dedicated IP pool. May contain lowercase letters, numbers and
     * dashes, up to 64 characters. If omitted, a deterministic lowercase
     * physical name is generated from the app, stage, and logical ID. Changing
     * the name replaces the pool.
     */
    poolName?: string;
    /**
     * The pool's scaling mode. Switching `STANDARD` → `MANAGED` is applied in
     * place via `putDedicatedIpPoolScalingAttributes`; AWS does not support
     * `MANAGED` → `STANDARD`, so that direction replaces the pool.
     * @default "STANDARD"
     */
    scalingMode?: DedicatedIpPoolScalingMode;
    /**
     * Tags to apply to the pool. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface DedicatedIpPool extends Resource<"AWS.SES.DedicatedIpPool", DedicatedIpPoolProps, {
    /** Name of the dedicated IP pool. */
    poolName: string;
    /** The pool's scaling mode. */
    scalingMode: DedicatedIpPoolScalingMode;
}, never, Providers> {
}
/**
 * An Amazon SES v2 dedicated IP pool — a named group of dedicated IP addresses
 * used to send email, so you can isolate the sending reputation of different
 * kinds of mail (e.g. marketing vs. transactional).
 *
 * :::caution
 * Creating a dedicated IP pool provisions dedicated IP capacity and **starts
 * billing immediately** — `MANAGED` pools bill for managed dedicated IP usage
 * as soon as they exist, and `STANDARD` pools bill per dedicated IP you add.
 * Only create pools you intend to pay for.
 * :::
 *
 * `STANDARD` → `MANAGED` is an in-place scaling change. `MANAGED` → `STANDARD`
 * is not supported by AWS and replaces the pool.
 * ### Creating Pools
 * **Example:** Standard Pool
 * ```typescript
 * import * as SES from "alchemy/AWS/SES";
 *
 * const pool = yield* SES.DedicatedIpPool("Marketing", {
 *   scalingMode: "STANDARD",
 * });
 * ```
 *
 * **Example:** Managed Pool
 * ```typescript
 * const pool = yield* SES.DedicatedIpPool("Transactional", {
 *   scalingMode: "MANAGED",
 * });
 * ```
 *
 * **Example:** Explicit Pool Name
 * ```typescript
 * // Without poolName a deterministic lowercase name is derived from
 * // app/stage/id. Pool names allow lowercase letters, numbers, and dashes.
 * const pool = yield* SES.DedicatedIpPool("Marketing", {
 *   poolName: "acme-marketing",
 * });
 * ```
 *
 * ### Changing the Scaling Mode
 * **Example:** Migrate a Standard Pool to Managed
 * ```typescript
 * // STANDARD -> MANAGED is applied in place — the pool keeps its name and
 * // its dedicated IPs.
 * const pool = yield* SES.DedicatedIpPool("Marketing", {
 *   scalingMode: "MANAGED", // was "STANDARD"
 * });
 *
 * // MANAGED -> STANDARD has no AWS API, so it REPLACES the pool: a new pool
 * // is created and the old one deleted, dropping its dedicated IPs.
 * ```
 *
 * ### Isolating Reputation
 * **Example:** Separate Marketing and Transactional Reputation
 * ```typescript
 * // Give each kind of mail its own pool so a marketing reputation hit
 * // cannot take down password resets.
 * const marketing = yield* SES.DedicatedIpPool("Marketing", {
 *   scalingMode: "STANDARD",
 * });
 * const transactional = yield* SES.DedicatedIpPool("Transactional", {
 *   scalingMode: "MANAGED",
 * });
 * ```
 *
 * @resource
 */
export declare const DedicatedIpPool: import("../../Resource.ts").ResourceClass<DedicatedIpPool>;
export declare const DedicatedIpPoolProvider: () => import("effect/Layer").Layer<Provider.Provider<DedicatedIpPool>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DedicatedIpPool.d.ts.map