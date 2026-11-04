import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * The activation state of a lifecycle policy. `ERROR` is only ever observed
 * (e.g. when the execution role was deleted out-of-band) — it cannot be set.
 */
export type LifecyclePolicyState = "ENABLED" | "DISABLED" | "ERROR";
/**
 * The policy type. `EBS_SNAPSHOT_MANAGEMENT` manages the lifecycle of EBS
 * snapshots; `IMAGE_MANAGEMENT` manages the lifecycle of EBS-backed AMIs.
 */
export type LifecyclePolicyType = "EBS_SNAPSHOT_MANAGEMENT" | "IMAGE_MANAGEMENT";
/** Unit for retention intervals. */
export type LifecyclePolicyRetentionUnit = "DAYS" | "WEEKS" | "MONTHS" | "YEARS";
export interface LifecyclePolicyCreateRule {
    /**
     * Where snapshots are created for policies targeting resources on an
     * Outpost or in a Local Zone.
     * @default "CLOUD"
     */
    location?: "CLOUD" | "OUTPOST_LOCAL" | "LOCAL_ZONE";
    /**
     * The interval between policy runs, in `intervalUnit` units (`1`, `2`,
     * `3`, `4`, `6`, `8`, `12` or `24` hours). Mutually exclusive with
     * `cronExpression`.
     */
    interval?: number;
    /**
     * The unit for {@link LifecyclePolicyCreateRule.interval}.
     * @default "HOURS"
     */
    intervalUnit?: "HOURS";
    /**
     * The time(s) of day (UTC, `HH:MM`) the policy runs when using
     * interval-based scheduling.
     */
    times?: string[];
    /**
     * A cron expression (`cron(...)`, intervals of at least 1 hour) that
     * defines when the policy runs. Mutually exclusive with `interval`.
     */
    cronExpression?: string;
}
export interface LifecyclePolicyRetainRule {
    /**
     * Number of snapshots/AMIs to retain per volume/instance (`1` - `1000`).
     * Mutually exclusive with `interval`/`intervalUnit`.
     */
    count?: number;
    /**
     * Age-based retention interval. Mutually exclusive with `count`.
     */
    interval?: number;
    /**
     * The unit for {@link LifecyclePolicyRetainRule.interval}.
     */
    intervalUnit?: LifecyclePolicyRetentionUnit;
}
export interface LifecyclePolicyFastRestoreRule {
    /**
     * Number of snapshots to keep fast-restore enabled for. Mutually
     * exclusive with `interval`.
     */
    count?: number;
    /**
     * Age-based fast-restore window. Mutually exclusive with `count`.
     */
    interval?: number;
    /** The unit for `interval`. */
    intervalUnit?: LifecyclePolicyRetentionUnit;
    /** Availability Zones in which to enable fast snapshot restore. */
    availabilityZones?: string[];
}
export interface LifecyclePolicyCrossRegionCopyRule {
    /**
     * The target region (e.g. `us-east-1`) or the ARN of a target Outpost
     * for the snapshot/AMI copies.
     */
    target: string;
    /**
     * Whether the copies are encrypted. Copies of encrypted sources are
     * always encrypted regardless of this setting.
     */
    encrypted: boolean;
    /**
     * The ARN of the KMS key to use for the copies when encryption is
     * enabled. Defaults to the default EBS KMS key when omitted.
     */
    cmkArn?: string;
    /**
     * Whether tags on the source are copied to the cross-region copies.
     * @default false
     */
    copyTags?: boolean;
    /** Retention rule for the cross-region copies. */
    retainRule?: {
        /** How long to retain the copies. */
        interval?: number;
        /** The unit for `interval`. */
        intervalUnit?: LifecyclePolicyRetentionUnit;
    };
    /**
     * AMI deprecation rule for the cross-region AMI copies
     * (`IMAGE_MANAGEMENT` policies only).
     */
    deprecateRule?: {
        /** How long before the AMI copies are deprecated. */
        interval?: number;
        /** The unit for `interval`. */
        intervalUnit?: LifecyclePolicyRetentionUnit;
    };
}
export interface LifecyclePolicyShareRule {
    /** IDs of the AWS accounts to share the snapshots with. */
    targetAccounts: string[];
    /** Period after which the snapshots are unshared. */
    unshareInterval?: number;
    /** The unit for `unshareInterval`. */
    unshareIntervalUnit?: LifecyclePolicyRetentionUnit;
}
export interface LifecyclePolicySchedule {
    /** Name of the schedule (`0` - `120` characters). */
    name?: string;
    /**
     * Whether tags are copied from the source volume/instance to the
     * snapshot/AMI.
     * @default false
     */
    copyTags?: boolean;
    /** Tags added to every snapshot/AMI created by this schedule. */
    tagsToAdd?: Record<string, string>;
    /**
     * Variable tags added to snapshots (`EBS_SNAPSHOT_MANAGEMENT` policies
     * targeting instances only). Values may use `$(instance-id)` and
     * `$(timestamp)`.
     */
    variableTags?: Record<string, string>;
    /** When the schedule creates snapshots/AMIs. */
    createRule?: LifecyclePolicyCreateRule;
    /** How long the snapshots/AMIs are retained. */
    retainRule?: LifecyclePolicyRetainRule;
    /**
     * Fast snapshot restore rule (`EBS_SNAPSHOT_MANAGEMENT` policies only).
     */
    fastRestoreRule?: LifecyclePolicyFastRestoreRule;
    /** Cross-region copy rules (up to 3). */
    crossRegionCopyRules?: LifecyclePolicyCrossRegionCopyRule[];
    /**
     * Snapshot sharing rules (`EBS_SNAPSHOT_MANAGEMENT` policies only).
     */
    shareRules?: LifecyclePolicyShareRule[];
    /**
     * AMI deprecation rule (`IMAGE_MANAGEMENT` policies only). Mutually
     * exclusive constraints mirror the retain rule (`count` vs `interval`).
     */
    deprecateRule?: {
        /** Number of newest AMIs to keep un-deprecated. */
        count?: number;
        /** Age after which AMIs are deprecated. */
        interval?: number;
        /** The unit for `interval`. */
        intervalUnit?: LifecyclePolicyRetentionUnit;
    };
    /**
     * Snapshot archiving rule (`EBS_SNAPSHOT_MANAGEMENT` policies with
     * count-based retention only).
     */
    archiveRule?: {
        /** Retention for snapshots in the archive tier. */
        retainRule: {
            /** Archive-tier retention settings. */
            retentionArchiveTier: {
                /** Number of snapshots to retain in the archive tier. */
                count?: number;
                /** Age-based archive-tier retention. */
                interval?: number;
                /** The unit for `interval`. */
                intervalUnit?: LifecyclePolicyRetentionUnit;
            };
        };
    };
}
export interface LifecyclePolicyDetails {
    /**
     * The policy type. Changing the type triggers a replacement.
     * @default "EBS_SNAPSHOT_MANAGEMENT"
     */
    policyType?: LifecyclePolicyType;
    /**
     * The resource type targeted by the policy. `VOLUME` creates snapshots
     * of individual volumes; `INSTANCE` creates multi-volume snapshot sets
     * (or AMIs for `IMAGE_MANAGEMENT`).
     */
    resourceTypes?: ("VOLUME" | "INSTANCE")[];
    /**
     * The location of the targeted resources.
     * @default ["CLOUD"]
     */
    resourceLocations?: ("CLOUD" | "OUTPOST" | "LOCAL_ZONE")[];
    /**
     * The resource tags that identify the volumes/instances the policy
     * applies to.
     */
    targetTags?: Record<string, string>;
    /** The schedules (1 mandatory + up to 3 optional). */
    schedules?: LifecyclePolicySchedule[];
    /** Options specific to the policy/resource type. */
    parameters?: {
        /**
         * Exclude the boot volume from multi-volume snapshot sets
         * (`EBS_SNAPSHOT_MANAGEMENT` targeting instances only).
         * @default false
         */
        excludeBootVolume?: boolean;
        /**
         * Skip rebooting the instance when creating AMIs
         * (`IMAGE_MANAGEMENT` only).
         * @default true
         */
        noReboot?: boolean;
        /**
         * Exclude data volumes with these tags from multi-volume snapshot
         * sets (`EBS_SNAPSHOT_MANAGEMENT` targeting instances only).
         */
        excludeDataVolumeTags?: Record<string, string>;
    };
}
export interface LifecyclePolicyProps {
    /**
     * Description of the policy (`0` - `500` characters; letters, digits,
     * spaces, `_` and `-`). If omitted, a deterministic description is
     * generated from the app, stage, and logical ID.
     */
    description?: string;
    /**
     * The activation state of the policy.
     * @default "ENABLED"
     */
    state?: "ENABLED" | "DISABLED";
    /**
     * The ARN of an existing IAM role Amazon Data Lifecycle Manager assumes
     * to run the policy. When omitted, an execution role is created
     * automatically with `dlm.amazonaws.com` trust and the AWS managed
     * policy matching the policy type (`AWSDataLifecycleManagerServiceRole`
     * for snapshot policies, `AWSDataLifecycleManagerServiceRoleForAMIManagement`
     * for AMI policies).
     */
    executionRoleArn?: string;
    /**
     * The configuration of the policy: what it targets and when/how it
     * creates and retains snapshots or AMIs.
     */
    policyDetails: LifecyclePolicyDetails;
    /**
     * Tags to apply to the lifecycle policy. Merged with internal Alchemy
     * tags.
     */
    tags?: Record<string, string>;
}
export interface LifecyclePolicy extends Resource<"AWS.DLM.LifecyclePolicy", LifecyclePolicyProps, {
    /** The auto-assigned ID of the policy (e.g. `policy-0123456789abcdef0`). */
    policyId: string;
    /** ARN of the policy. */
    policyArn: string;
    /** The activation state of the policy. */
    state: LifecyclePolicyState;
    /** The ARN of the IAM role the policy runs as. */
    executionRoleArn: string;
    /**
     * Name of the auto-created execution role. `undefined` when an
     * explicit {@link LifecyclePolicyProps.executionRoleArn} is used.
     */
    roleName: string | undefined;
}, never, Providers> {
}
/**
 * An Amazon Data Lifecycle Manager (DLM) lifecycle policy that automates the
 * creation, retention, and deletion of EBS snapshots or EBS-backed AMIs.
 *
 * `LifecyclePolicy` owns a custom `EBS_SNAPSHOT_MANAGEMENT` or
 * `IMAGE_MANAGEMENT` policy. Volumes/instances are targeted by tags, and an
 * execution role is created automatically unless an explicit
 * `executionRoleArn` is given.
 * ### Creating Policies
 * **Example:** Daily EBS snapshots retained for a week
 * ```typescript
 * import * as DLM from "alchemy/AWS/DLM";
 *
 * const policy = yield* DLM.LifecyclePolicy("DailySnapshots", {
 *   policyDetails: {
 *     resourceTypes: ["VOLUME"],
 *     targetTags: { Backup: "daily" },
 *     schedules: [
 *       {
 *         name: "Daily",
 *         createRule: { interval: 24, intervalUnit: "HOURS", times: ["03:00"] },
 *         retainRule: { count: 7 },
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * **Example:** Cron-scheduled snapshots
 * ```typescript
 * const policy = yield* DLM.LifecyclePolicy("WeeklySnapshots", {
 *   description: "Weekly volume snapshots",
 *   policyDetails: {
 *     resourceTypes: ["VOLUME"],
 *     targetTags: { Backup: "weekly" },
 *     schedules: [
 *       {
 *         name: "Weekly",
 *         copyTags: true,
 *         createRule: { cronExpression: "cron(0 4 ? * SUN *)" },
 *         retainRule: { interval: 1, intervalUnit: "MONTHS" },
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * ### AMI Policies
 * **Example:** EBS-backed AMIs of tagged instances
 * ```typescript
 * const amis = yield* DLM.LifecyclePolicy("NightlyAmis", {
 *   policyDetails: {
 *     policyType: "IMAGE_MANAGEMENT",
 *     resourceTypes: ["INSTANCE"],
 *     targetTags: { Backup: "ami" },
 *     parameters: { noReboot: true },
 *     schedules: [
 *       {
 *         name: "Nightly",
 *         createRule: { interval: 24, intervalUnit: "HOURS", times: ["05:00"] },
 *         retainRule: { count: 3 },
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * ### Execution Role
 * **Example:** Bring your own execution role
 * ```typescript
 * const role = yield* IAM.Role("DlmRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { Service: "dlm.amazonaws.com" },
 *         Action: "sts:AssumeRole",
 *       },
 *     ],
 *   },
 *   managedPolicyArns: [
 *     "arn:aws:iam::aws:policy/service-role/AWSDataLifecycleManagerServiceRole",
 *   ],
 * });
 *
 * const policy = yield* DLM.LifecyclePolicy("Snapshots", {
 *   executionRoleArn: role.roleArn,
 *   state: "DISABLED",
 *   policyDetails: {
 *     resourceTypes: ["VOLUME"],
 *     targetTags: { Backup: "true" },
 *     schedules: [
 *       {
 *         name: "Daily",
 *         createRule: { interval: 24, intervalUnit: "HOURS" },
 *         retainRule: { count: 2 },
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const LifecyclePolicy: import("../../Resource.ts").ResourceClass<LifecyclePolicy>;
export declare const LifecyclePolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<LifecyclePolicy>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=LifecyclePolicy.d.ts.map