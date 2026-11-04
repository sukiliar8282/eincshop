import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * Opt-in status of a Region as reported by `account:GetRegionOptStatus`:
 * `ENABLED`, `ENABLING`, `DISABLING`, `DISABLED`, or `ENABLED_BY_DEFAULT`.
 */
export type RegionOptStatus = string;
export interface RegionProps {
    /**
     * Name of the Region to manage, e.g. `ap-east-1`. Changing the Region
     * replaces the resource.
     */
    regionName: string;
    /**
     * Whether the Region should be opted in (enabled) for the account. Regions
     * that are `ENABLED_BY_DEFAULT` cannot be disabled — attempting to disable
     * one fails with a `ValidationException`.
     */
    enabled: boolean;
    /**
     * Account ID to operate on. Only usable from an Organizations management or
     * delegated-admin account with trusted access enabled; omit to target the
     * calling account.
     */
    accountId?: string;
}
export interface Region extends Resource<"AWS.Account.Region", RegionProps, {
    /** Name of the Region, e.g. `ap-east-1`. */
    regionName: string;
    /** Whether the Region is currently enabled for the account. */
    enabled: boolean;
    /**
     * Observed opt-in status: `ENABLED`, `ENABLING`, `DISABLING`, `DISABLED`,
     * or `ENABLED_BY_DEFAULT`.
     */
    regionOptStatus: RegionOptStatus;
}, never, Providers> {
}
/**
 * The opt-in status of an AWS Region for an account. Opt-in Regions (e.g.
 * `ap-east-1`, `me-south-1`) are disabled by default and must be enabled
 * before use; this resource drives `account:EnableRegion` /
 * `account:DisableRegion` to converge the Region to the desired status.
 *
 * Enabling or disabling a Region is asynchronous and can take several
 * minutes; reconcile waits (bounded) for the transition to settle and records
 * the observed status either way. Disabling a Region removes all IAM access
 * to resources in it, so destroying this resource intentionally does NOT
 * disable the Region — it only stops managing it (set `enabled: false`
 * explicitly to opt out).
 *
 * ### Managing Region Opt-In
 * **Example:** Enable an Opt-In Region
 * ```typescript
 * const region = yield* Account.Region("HongKong", {
 *   regionName: "ap-east-1",
 *   enabled: true,
 * });
 * ```
 *
 * **Example:** Track a Default Region
 * ```typescript
 * const region = yield* Account.Region("UsEast1", {
 *   regionName: "us-east-1",
 *   enabled: true, // ENABLED_BY_DEFAULT — reconcile makes no API mutation
 * });
 * ```
 *
 * **Example:** Opt Out of a Region
 * ```typescript
 * const region = yield* Account.Region("HongKong", {
 *   regionName: "ap-east-1",
 *   enabled: false,
 * });
 * ```
 *
 * @resource
 */
export declare const Region: import("../../Resource.ts").ResourceClass<Region>;
export declare const RegionProvider: () => import("effect/Layer").Layer<Provider.Provider<Region>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Region.d.ts.map