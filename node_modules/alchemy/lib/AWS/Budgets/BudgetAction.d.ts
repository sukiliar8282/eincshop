import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { BudgetSubscriber } from "./Budget.ts";
/**
 * The threshold that triggers a budget action.
 */
export interface BudgetActionThreshold {
    /**
     * The threshold value. Interpreted as a percentage of the budget limit by
     * default, or an absolute amount when `actionThresholdType` is
     * `ABSOLUTE_VALUE`.
     */
    actionThresholdValue: number;
    /**
     * Whether the threshold is a percentage of the budget or an absolute value.
     */
    actionThresholdType: "PERCENTAGE" | "ABSOLUTE_VALUE" | (string & {});
}
/**
 * What the action does when it fires — exactly one of the three definitions
 * must be set, matching the action's `actionType`.
 */
export interface BudgetActionDefinition {
    /**
     * For `APPLY_IAM_POLICY` actions — attach the managed policy to the given
     * IAM roles, groups, and/or users.
     */
    iamActionDefinition?: {
        /** ARN of the managed policy to attach. */
        policyArn: string;
        /** IAM role names to attach the policy to. */
        roles?: string[];
        /** IAM group names to attach the policy to. */
        groups?: string[];
        /** IAM user names to attach the policy to. */
        users?: string[];
    };
    /**
     * For `APPLY_SCP_POLICY` actions — attach the service control policy to
     * the given Organizations targets.
     */
    scpActionDefinition?: {
        /** The SCP policy ID. */
        policyId: string;
        /** Organizations target IDs (accounts or OUs). */
        targetIds: string[];
    };
    /**
     * For `RUN_SSM_DOCUMENTS` actions — stop the given EC2 or RDS instances.
     */
    ssmActionDefinition?: {
        /** Which instances to stop. */
        actionSubType: "STOP_EC2_INSTANCES" | "STOP_RDS_INSTANCES" | (string & {});
        /** Region of the instances. */
        region: string;
        /** Instance IDs to stop. */
        instanceIds: string[];
    };
}
export interface BudgetActionProps {
    /**
     * Name of the budget the action belongs to.
     *
     * Changing the budget replaces the action.
     */
    budgetName: string;
    /**
     * Whether the action triggers on actual or forecasted spend.
     */
    notificationType: "ACTUAL" | "FORECASTED" | (string & {});
    /**
     * The kind of action to run when the threshold is crossed.
     *
     * Changing the action type replaces the action.
     */
    actionType: "APPLY_IAM_POLICY" | "APPLY_SCP_POLICY" | "RUN_SSM_DOCUMENTS" | (string & {});
    /**
     * The threshold that triggers the action.
     */
    actionThreshold: BudgetActionThreshold;
    /**
     * What the action does — must match `actionType`.
     */
    definition: BudgetActionDefinition;
    /**
     * ARN of the IAM role AWS Budgets assumes to run the action. The role must
     * trust `budgets.amazonaws.com`.
     */
    executionRoleArn: string;
    /**
     * Whether the action runs automatically when the threshold is crossed or
     * requires manual approval.
     * @default "MANUAL"
     */
    approvalModel?: "AUTOMATIC" | "MANUAL" | (string & {});
    /**
     * Subscribers notified when the action is triggered or requires approval.
     */
    subscribers: BudgetSubscriber[];
    /**
     * Tags applied to the budget action.
     */
    tags?: Record<string, string>;
}
export interface BudgetAction extends Resource<"AWS.Budgets.BudgetAction", BudgetActionProps, {
    /**
     * The system-generated ID of the action.
     */
    actionId: string;
    /**
     * Name of the budget the action belongs to.
     */
    budgetName: string;
    /**
     * The AWS account ID that owns the action.
     */
    accountId: string;
    /**
     * ARN of the action, e.g.
     * `arn:aws:budgets::123456789012:budget/my-budget/action/abc123`.
     */
    actionArn: string;
}, never, Providers> {
}
/**
 * An AWS Budgets action — runs an IAM policy attachment, SCP attachment, or
 * SSM stop-instances document when a budget threshold is crossed, either
 * automatically or after manual approval.
 *
 * The execution role must trust `budgets.amazonaws.com` and carry the
 * permissions the action needs (the AWS managed policy
 * `AWSBudgetsActionsWithAWSResourceControlAccess` covers all three kinds).
 *
 * ### Creating a Budget Action
 * **Example:** Apply a Deny-All Policy at 100% of the Budget
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const budget = yield* AWS.Budgets.Budget("MonthlyCost", {
 *   budgetLimit: { amount: "100", unit: "USD" },
 * });
 *
 * const action = yield* AWS.Budgets.BudgetAction("FreezeSpend", {
 *   budgetName: budget.budgetName,
 *   notificationType: "ACTUAL",
 *   actionType: "APPLY_IAM_POLICY",
 *   actionThreshold: {
 *     actionThresholdValue: 100,
 *     actionThresholdType: "PERCENTAGE",
 *   },
 *   definition: {
 *     iamActionDefinition: {
 *       policyArn: "arn:aws:iam::aws:policy/AWSDenyAll",
 *       roles: [devRole.roleName],
 *     },
 *   },
 *   executionRoleArn: executionRole.roleArn,
 *   approvalModel: "MANUAL",
 *   subscribers: [{ subscriptionType: "EMAIL", address: "team@example.com" }],
 * });
 * ```
 *
 * **Example:** Stop EC2 Instances Automatically
 * ```typescript
 * const action = yield* AWS.Budgets.BudgetAction("StopDevInstances", {
 *   budgetName: budget.budgetName,
 *   notificationType: "ACTUAL",
 *   actionType: "RUN_SSM_DOCUMENTS",
 *   actionThreshold: {
 *     actionThresholdValue: 100,
 *     actionThresholdType: "PERCENTAGE",
 *   },
 *   definition: {
 *     ssmActionDefinition: {
 *       actionSubType: "STOP_EC2_INSTANCES",
 *       region: "us-east-1",
 *       instanceIds: [instance.instanceId],
 *     },
 *   },
 *   executionRoleArn: executionRole.roleArn,
 *   approvalModel: "AUTOMATIC",
 *   subscribers: [{ subscriptionType: "EMAIL", address: "team@example.com" }],
 * });
 * ```
 *
 * @resource
 */
export declare const BudgetAction: import("../../Resource.ts").ResourceClass<BudgetAction>;
/**
 * Compute the ARN of a budget action. Budgets is a global service, so the ARN
 * has no region component.
 */
export declare const budgetActionArn: (accountId: string, budgetName: string, actionId: string) => string;
export declare const BudgetActionProvider: () => import("effect/Layer").Layer<Provider.Provider<BudgetAction>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=BudgetAction.d.ts.map