import * as rbin from "@distilled.cloud/aws/rbin";
import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * A resource tag used to identify (or exclude) resources covered by a
 * retention rule.
 */
export interface RuleResourceTag {
    /**
     * The tag key.
     */
    key: string;
    /**
     * The tag value. Omit to match any resource that has the tag key,
     * regardless of value.
     */
    value?: string;
}
/**
 * Lock configuration for a Region-level retention rule. A locked rule
 * cannot be modified or deleted until it is unlocked and the unlock delay
 * period expires.
 */
export interface RuleLockConfiguration {
    /**
     * The unlock delay that must expire after the rule is unlocked before it
     * can be modified or deleted (e.g. `"7 days"`; valid range 7-30 days).
     * Sent to the API in whole days.
     */
    unlockDelay: Duration.Input;
}
export interface RuleProps {
    /**
     * The resource type to be retained by the retention rule:
     * `EBS_SNAPSHOT` for Amazon EBS snapshots, `EC2_IMAGE` for EBS-backed
     * AMIs, or `EBS_VOLUME` for Amazon EBS volumes.
     * Changing the resource type replaces the rule.
     */
    resourceType: "EBS_SNAPSHOT" | "EC2_IMAGE" | "EBS_VOLUME";
    /**
     * The period for which the retention rule retains resources after they
     * are deleted (e.g. `"7 days"` or `Duration.days(7)`; valid range
     * 1-365 days). Sent to the API in whole days.
     */
    retentionPeriod: Duration.Input;
    /**
     * A brief description of the retention rule.
     */
    description?: string;
    /**
     * Resource tags that identify the resources to retain (a **tag-level**
     * retention rule). Resources of the specified type that have at least one
     * of these tag key/value pairs are retained in the Recycle Bin upon
     * deletion. Omit (along with `excludeResourceTags`) to create a
     * **Region-level** rule that retains all resources of the type in the
     * Region.
     */
    resourceTags?: RuleResourceTag[];
    /**
     * Exclusion tags for a Region-level retention rule. Resources that have
     * any of these tag key/value pairs are NOT retained by the rule. Cannot
     * be combined with `resourceTags` or `lockConfiguration`.
     */
    excludeResourceTags?: RuleResourceTag[];
    /**
     * Lock configuration for the rule. Only Region-level rules without
     * exclusion tags can be locked. A locked rule cannot be modified or
     * deleted; removing this prop unlocks the rule, which then remains in
     * `pending_unlock` until the unlock delay (7-30 days) expires.
     */
    lockConfiguration?: RuleLockConfiguration;
    /**
     * Tags to apply to the retention rule itself. Merged with internal
     * Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Rule extends Resource<"AWS.Rbin.Rule", RuleProps, {
    /** The unique ID of the retention rule (e.g. `1a2b3c4d-5e6f-...`). */
    identifier: string;
    /** The Amazon Resource Name (ARN) of the retention rule. */
    ruleArn: string;
    /** The resource type retained by the retention rule. */
    resourceType: rbin.ResourceType;
    /** The state of the retention rule (`pending` or `available`). */
    status: rbin.RuleStatus;
    /** The lock state of the retention rule, if lockable. */
    lockState?: rbin.LockState;
}, never, Providers> {
}
/**
 * A Recycle Bin retention rule. Recycle Bin retains deleted EBS snapshots,
 * EBS-backed AMIs, and EBS volumes for a configurable period so they can be
 * recovered after accidental deletion.
 *
 * Rules are either **tag-level** (retain only resources carrying specific
 * resource tags) or **Region-level** (retain every resource of the type in
 * the Region, optionally minus exclusion tags). Changing `resourceType`
 * replaces the rule; every other property updates in place.
 *
 * ### Creating Retention Rules
 * **Example:** Tag-level rule for EBS snapshots
 * ```typescript
 * import * as Rbin from "alchemy/AWS/Rbin";
 *
 * const rule = yield* Rbin.Rule("SnapshotRetention", {
 *   resourceType: "EBS_SNAPSHOT",
 *   retentionPeriod: "7 days",
 *   description: "Retain tagged snapshots for 7 days",
 *   resourceTags: [{ key: "team", value: "data" }],
 * });
 * ```
 *
 * **Example:** Region-level rule for AMIs
 * ```typescript
 * const rule = yield* Rbin.Rule("AmiRetention", {
 *   resourceType: "EC2_IMAGE",
 *   retentionPeriod: "14 days",
 *   description: "Retain all deregistered AMIs in this Region",
 * });
 * ```
 *
 * **Example:** Region-level rule with exclusion tags
 * ```typescript
 * const rule = yield* Rbin.Rule("SnapshotRetention", {
 *   resourceType: "EBS_SNAPSHOT",
 *   retentionPeriod: "30 days",
 *   excludeResourceTags: [{ key: "ephemeral", value: "true" }],
 * });
 * ```
 *
 * ### Locking
 * A Region-level rule (without exclusion tags) can be locked so it cannot
 * be modified or deleted. Removing `lockConfiguration` unlocks the rule,
 * which stays protected in `pending_unlock` until the unlock delay expires.
 *
 * **Example:** Locked Region-level rule
 * ```typescript
 * const rule = yield* Rbin.Rule("LockedRetention", {
 *   resourceType: "EBS_SNAPSHOT",
 *   retentionPeriod: "30 days",
 *   lockConfiguration: { unlockDelay: "7 days" },
 * });
 * ```
 *
 * ### Tagging
 * **Example:** Tag the rule itself
 * ```typescript
 * const rule = yield* Rbin.Rule("SnapshotRetention", {
 *   resourceType: "EBS_SNAPSHOT",
 *   retentionPeriod: "7 days",
 *   resourceTags: [{ key: "team", value: "data" }],
 *   tags: { CostCenter: "storage" },
 * });
 * ```
 *
 * @resource
 */
export declare const Rule: import("../../Resource.ts").ResourceClass<Rule>;
declare const RbinLockUnsupported_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "RbinLockUnsupported";
} & Readonly<A>;
/**
 * Raised when a `Rule` combines `lockConfiguration` with `resourceTags` or
 * `excludeResourceTags`. Recycle Bin only supports locking Region-level
 * retention rules that have no exclusion tags.
 */
export declare class RbinLockUnsupported extends RbinLockUnsupported_base<{
    message: string;
}> {
}
export declare const RuleProvider: () => import("effect/Layer").Layer<Provider.Provider<Rule>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Rule.d.ts.map