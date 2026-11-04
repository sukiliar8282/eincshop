import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * A tag-based condition used to select resources for backup by matching the
 * tags attached to them.
 */
export interface BackupSelectionTagCondition {
    /**
     * How the tag is matched. `STRINGEQUALS` is the only supported operator
     * for the legacy `listOfTags` selector.
     */
    conditionType?: "STRINGEQUALS" | (string & {});
    /**
     * The tag key to match, e.g. `aws:ResourceTag/backup`.
     */
    conditionKey: string;
    /**
     * The tag value to match.
     */
    conditionValue: string;
}
export interface BackupSelectionProps {
    /**
     * ID of the backup plan this selection assigns resources to. Typically the
     * `backupPlanId` attribute of a {@link BackupPlan}.
     *
     * Changing the plan replaces the selection.
     */
    backupPlanId: string;
    /**
     * Display name for the selection. If omitted, a unique name is generated
     * from the app, stage, and logical ID.
     *
     * A backup selection is immutable — changing the name replaces it.
     */
    selectionName?: string;
    /**
     * ARN of the IAM role AWS Backup assumes to create and manage backups on
     * your behalf. The role's trust policy must allow `backup.amazonaws.com`.
     *
     * Immutable — changing the role replaces the selection.
     */
    iamRoleArn: string;
    /**
     * ARNs of the resources to assign to the backup plan. Use `["*"]` to
     * assign all supported resources.
     *
     * Immutable — changing the resource list replaces the selection.
     */
    resources?: string[];
    /**
     * ARNs of resources to explicitly exclude from the plan.
     *
     * Immutable — changing this replaces the selection.
     */
    notResources?: string[];
    /**
     * Tag-based conditions selecting resources by their tags (legacy
     * `ListOfTags` selector — conditions are ANDed together).
     *
     * Immutable — changing this replaces the selection.
     */
    listOfTags?: BackupSelectionTagCondition[];
}
export interface BackupSelection extends Resource<"AWS.Backup.BackupSelection", BackupSelectionProps, {
    /**
     * Service-assigned unique ID of the selection.
     */
    selectionId: string;
    /**
     * Name of the selection.
     */
    selectionName: string;
    /**
     * ID of the backup plan the selection is attached to.
     */
    backupPlanId: string;
}, never, Providers> {
}
/**
 * An AWS Backup selection — assigns AWS resources to a {@link BackupPlan}
 * either by explicit ARN or by matching resource tags, using an IAM role that
 * AWS Backup assumes to perform the backups.
 *
 * A selection is immutable: any change to its name, role, or resource set
 * replaces it.
 *
 * ### Assigning Resources
 * **Example:** Assign resources by tag
 * ```typescript
 * import * as Backup from "alchemy/AWS/Backup";
 *
 * const selection = yield* Backup.BackupSelection("TaggedResources", {
 *   backupPlanId: plan.backupPlanId,
 *   iamRoleArn: backupRole.roleArn,
 *   listOfTags: [
 *     {
 *       conditionType: "STRINGEQUALS",
 *       conditionKey: "aws:ResourceTag/backup",
 *       conditionValue: "daily",
 *     },
 *   ],
 * });
 * ```
 *
 * **Example:** Assign resources by ARN
 * ```typescript
 * const selection = yield* Backup.BackupSelection("ExplicitResources", {
 *   backupPlanId: plan.backupPlanId,
 *   iamRoleArn: backupRole.roleArn,
 *   resources: [table.tableArn],
 * });
 * ```
 *
 * @resource
 */
export declare const BackupSelection: import("../../Resource.ts").ResourceClass<BackupSelection>;
export declare const BackupSelectionProvider: () => import("effect/Layer").Layer<Provider.Provider<BackupSelection>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=BackupSelection.d.ts.map