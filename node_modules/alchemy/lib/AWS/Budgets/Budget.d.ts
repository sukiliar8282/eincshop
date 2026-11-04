import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * A subscriber notified when a budget notification is triggered.
 */
export interface BudgetSubscriber {
    /**
     * How the subscriber is notified.
     */
    subscriptionType: "EMAIL" | "SNS" | (string & {});
    /**
     * The destination — an email address (for `EMAIL`) or an SNS topic ARN
     * (for `SNS`).
     */
    address: string;
}
/**
 * A threshold that, when crossed, notifies the configured subscribers.
 */
export interface BudgetNotification {
    /**
     * Whether the notification is based on actual or forecasted spend/usage.
     */
    notificationType: "ACTUAL" | "FORECASTED" | (string & {});
    /**
     * How the actual/forecasted amount is compared to the threshold.
     */
    comparisonOperator: "GREATER_THAN" | "LESS_THAN" | "EQUAL_TO" | (string & {});
    /**
     * The threshold value. Interpreted as a percentage of the budget limit by
     * default, or an absolute amount when `thresholdType` is `ABSOLUTE_VALUE`.
     */
    threshold: number;
    /**
     * Whether `threshold` is a percentage of the budget or an absolute value.
     * @default "PERCENTAGE"
     */
    thresholdType?: "PERCENTAGE" | "ABSOLUTE_VALUE" | (string & {});
    /**
     * Subscribers notified when this threshold is crossed.
     */
    subscribers: BudgetSubscriber[];
}
export interface BudgetProps {
    /**
     * Name of the budget. Must be unique within the account. If omitted, a
     * unique name is generated from the app, stage, and logical ID.
     *
     * Changing the name replaces the budget.
     */
    budgetName?: string;
    /**
     * What the budget tracks.
     * @default "COST"
     */
    budgetType?: "COST" | "USAGE" | "RI_UTILIZATION" | "RI_COVERAGE" | "SAVINGS_PLANS_UTILIZATION" | "SAVINGS_PLANS_COVERAGE" | (string & {});
    /**
     * The period the budget resets over.
     * @default "MONTHLY"
     */
    timeUnit?: "DAILY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY" | (string & {});
    /**
     * The budgeted amount and its unit, e.g. `{ amount: "100", unit: "USD" }`.
     * Required for `COST` and `USAGE` budgets.
     */
    budgetLimit?: {
        /** The amount, as a string, e.g. `"100"`. */
        amount: string;
        /** The unit — `"USD"` for cost budgets, or the usage unit. */
        unit: string;
    };
    /**
     * Cost filters restricting which costs count against the budget, e.g.
     * `{ Service: ["Amazon Elastic Compute Cloud - Compute"] }`.
     */
    costFilters?: Record<string, string[]>;
    /**
     * Notifications and their subscribers.
     */
    notifications?: BudgetNotification[];
    /**
     * Tags applied to the budget at creation.
     */
    tags?: Record<string, string>;
}
export interface Budget extends Resource<"AWS.Budgets.Budget", BudgetProps, {
    /**
     * Name of the budget.
     */
    budgetName: string;
    /**
     * The AWS account ID that owns the budget.
     */
    accountId: string;
    /**
     * ARN of the budget, e.g. `arn:aws:budgets::123456789012:budget/my-budget`.
     */
    budgetArn: string;
}, never, Providers> {
}
/**
 * An AWS Budget — tracks cost or usage against a defined limit over a time
 * period and notifies subscribers when configured thresholds are crossed.
 *
 * Budgets are a global (account-level) resource; they are free and take
 * effect immediately.
 *
 * ### Creating a Budget
 * **Example:** Monthly cost budget with an email alert at 80%
 * ```typescript
 * import * as Budgets from "alchemy/AWS/Budgets";
 *
 * const budget = yield* Budgets.Budget("MonthlyCost", {
 *   budgetType: "COST",
 *   timeUnit: "MONTHLY",
 *   budgetLimit: { amount: "100", unit: "USD" },
 *   notifications: [
 *     {
 *       notificationType: "ACTUAL",
 *       comparisonOperator: "GREATER_THAN",
 *       threshold: 80,
 *       thresholdType: "PERCENTAGE",
 *       subscribers: [{ subscriptionType: "EMAIL", address: "team@example.com" }],
 *     },
 *   ],
 * });
 * ```
 *
 * **Example:** Budget scoped to a single service
 * ```typescript
 * const budget = yield* Budgets.Budget("EC2Spend", {
 *   budgetLimit: { amount: "500", unit: "USD" },
 *   costFilters: {
 *     Service: ["Amazon Elastic Compute Cloud - Compute"],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Budget: import("../../Resource.ts").ResourceClass<Budget>;
/**
 * Compute the ARN of a budget. Budgets is a global service, so the ARN has no
 * region component.
 */
export declare const budgetArn: (accountId: string, budgetName: string) => string;
export declare const BudgetProvider: () => import("effect/Layer").Layer<Provider.Provider<Budget>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Budget.d.ts.map