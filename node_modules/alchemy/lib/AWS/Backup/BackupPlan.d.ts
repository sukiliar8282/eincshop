import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * Lifecycle policy controlling when a recovery point transitions to cold
 * storage and when it is deleted.
 */
export interface BackupRuleLifecycle {
    /**
     * Time after creation that a recovery point is moved to cold storage,
     * e.g. `"30 days"` (whole days on the wire). Must be at least 90 days
     * less than `deleteAfter`.
     */
    moveToColdStorageAfter?: Duration.Input;
    /**
     * Time after creation that a recovery point is deleted, e.g. `"365 days"`
     * (whole days on the wire).
     */
    deleteAfter?: Duration.Input;
    /**
     * Opt recovery points of supported resources into archive-tier storage.
     */
    optInToArchiveForSupportedResources?: boolean;
}
/**
 * A single scheduled backup rule within a backup plan.
 */
export interface BackupPlanRule {
    /**
     * Display name for the rule. Must be unique within the plan.
     */
    ruleName: string;
    /**
     * Name of the target backup vault where recovery points are stored.
     */
    targetBackupVaultName: string;
    /**
     * CRON expression (in UTC) specifying when the backup is taken, e.g.
     * `cron(0 5 ? * * *)`. Omit for continuous backup or on-demand plans.
     */
    scheduleExpression?: string;
    /**
     * Timezone the schedule expression is evaluated in.
     */
    scheduleExpressionTimezone?: string;
    /**
     * Time after the scheduled time within which a backup must start, or it
     * is canceled, e.g. `"1 hour"` (whole minutes on the wire).
     */
    startWindow?: Duration.Input;
    /**
     * Time within which a backup must complete, or it is canceled, e.g.
     * `"3 hours"` (whole minutes on the wire).
     */
    completionWindow?: Duration.Input;
    /**
     * Enables continuous backups (point-in-time restore) for supported
     * resources.
     */
    enableContinuousBackup?: boolean;
    /**
     * Lifecycle policy for the recovery points created by this rule.
     */
    lifecycle?: BackupRuleLifecycle;
    /**
     * Tags applied to recovery points created by this rule.
     */
    recoveryPointTags?: Record<string, string>;
}
export interface BackupPlanProps {
    /**
     * Display name of the backup plan. If omitted, a unique name is generated
     * from the app, stage, and logical ID.
     */
    backupPlanName?: string;
    /**
     * One or more scheduled backup rules that make up the plan.
     */
    rules: BackupPlanRule[];
    /**
     * Tags to apply to the backup plan. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface BackupPlan extends Resource<"AWS.Backup.BackupPlan", BackupPlanProps, {
    /**
     * Service-assigned unique ID of the backup plan.
     */
    backupPlanId: string;
    /**
     * ARN of the backup plan.
     */
    backupPlanArn: string;
    /**
     * Name of the backup plan.
     */
    backupPlanName: string;
    /**
     * Version ID of the plan; updated each time the plan document changes.
     */
    versionId: string;
}, never, Providers> {
}
/**
 * An AWS Backup plan — a policy expression that defines *when* and *how* you
 * want to back up your resources, composed of one or more scheduled rules
 * that each target a backup vault.
 *
 * Pair a plan with a {@link BackupSelection} to assign the AWS resources it
 * protects.
 *
 * ### Creating a Plan
 * **Example:** Daily backups retained for 30 days
 * ```typescript
 * import * as Backup from "alchemy/AWS/Backup";
 *
 * const vault = yield* Backup.BackupVault("AppBackups");
 *
 * const plan = yield* Backup.BackupPlan("DailyPlan", {
 *   rules: [
 *     {
 *       ruleName: "DailyBackups",
 *       targetBackupVaultName: vault.backupVaultName,
 *       scheduleExpression: "cron(0 5 ? * * *)",
 *       startWindow: "1 hour",
 *       completionWindow: "3 hours",
 *       lifecycle: { deleteAfter: "30 days" },
 *     },
 *   ],
 * });
 * ```
 *
 * **Example:** Move to cold storage then delete
 * ```typescript
 * const plan = yield* Backup.BackupPlan("ArchivePlan", {
 *   rules: [
 *     {
 *       ruleName: "MonthlyArchive",
 *       targetBackupVaultName: vault.backupVaultName,
 *       scheduleExpression: "cron(0 5 1 * ? *)",
 *       lifecycle: {
 *         moveToColdStorageAfter: "30 days",
 *         deleteAfter: "365 days",
 *       },
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const BackupPlan: import("../../Resource.ts").ResourceClass<BackupPlan>;
export declare const BackupPlanProvider: () => import("effect/Layer").Layer<Provider.Provider<BackupPlan>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=BackupPlan.d.ts.map