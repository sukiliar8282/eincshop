import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/** How Shield Advanced aggregates traffic across a protection group. */
export type ProtectionGroupAggregation = "SUM" | "MEAN" | "MAX";
/** Which protected resources are members of the group. */
export type ProtectionGroupPattern = "ALL" | "ARBITRARY" | "BY_RESOURCE_TYPE";
/** Resource type selector for `BY_RESOURCE_TYPE` groups. */
export type ProtectedResourceType = "CLOUDFRONT_DISTRIBUTION" | "ROUTE_53_HOSTED_ZONE" | "ELASTIC_IP_ALLOCATION" | "CLASSIC_LOAD_BALANCER" | "APPLICATION_LOAD_BALANCER" | "GLOBAL_ACCELERATOR";
export interface ProtectionGroupProps {
    /**
     * Identifier of the protection group (alphanumeric and `-`, max 36 chars).
     * Immutable — changing it replaces the group. If omitted, a unique id is
     * generated.
     */
    protectionGroupId?: string;
    /**
     * How Shield Advanced aggregates traffic across the group: `SUM` for
     * combined volume, `MEAN` for per-resource average, `MAX` for the highest
     * single-resource volume. Mutable.
     */
    aggregation: ProtectionGroupAggregation;
    /**
     * Which protected resources are members: `ALL` protected resources,
     * an `ARBITRARY` list (set `members`), or all of one `BY_RESOURCE_TYPE`
     * (set `resourceType`). Mutable.
     */
    pattern: ProtectionGroupPattern;
    /**
     * Resource type included in the group. Required when `pattern` is
     * `BY_RESOURCE_TYPE`; omit otherwise.
     */
    resourceType?: ProtectedResourceType;
    /**
     * ARNs of the protected resources in the group. Required when `pattern` is
     * `ARBITRARY`; omit otherwise.
     */
    members?: string[];
    /**
     * User-defined tags. Alchemy ownership tags are merged in automatically.
     */
    tags?: Record<string, string>;
}
export interface ProtectionGroup extends Resource<"AWS.Shield.ProtectionGroup", ProtectionGroupProps, {
    /** Identifier of the protection group. */
    protectionGroupId: string;
    /** ARN of the protection group. */
    protectionGroupArn: string;
    /** Traffic aggregation mode. */
    aggregation: string;
    /** Membership pattern. */
    pattern: string;
    /** Resource type for `BY_RESOURCE_TYPE` groups. */
    resourceType: string | undefined;
    /** Member resource ARNs for `ARBITRARY` groups. */
    members: string[];
    /** Tags on the protection group (including Alchemy ownership tags). */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS Shield Advanced Protection Group — a collective of protected
 * resources whose traffic Shield Advanced monitors as a unit, improving
 * detection accuracy and reducing false positives.
 *
 * Requires an active Shield Advanced subscription ($3,000/month with a 1-year
 * commitment); without one every call fails with the typed
 * `SubscriptionNotFound` error.
 *
 * ### Grouping Protections
 * **Example:** Group All Protected Resources
 * ```typescript
 * const group = yield* Shield.ProtectionGroup("AllResources", {
 *   aggregation: "SUM",
 *   pattern: "ALL",
 * });
 * ```
 *
 * **Example:** Group by Resource Type
 * ```typescript
 * const group = yield* Shield.ProtectionGroup("Distributions", {
 *   aggregation: "MAX",
 *   pattern: "BY_RESOURCE_TYPE",
 *   resourceType: "CLOUDFRONT_DISTRIBUTION",
 * });
 * ```
 *
 * **Example:** Arbitrary Member List
 * ```typescript
 * const group = yield* Shield.ProtectionGroup("Fleet", {
 *   aggregation: "MEAN",
 *   pattern: "ARBITRARY",
 *   members: [distribution.distributionArn],
 *   tags: { team: "platform" },
 * });
 * ```
 */
export declare const ProtectionGroup: import("../../Resource.ts").ResourceClass<ProtectionGroup>;
export declare const ProtectionGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<ProtectionGroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ProtectionGroup.d.ts.map