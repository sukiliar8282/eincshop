import * as deadline from "@distilled.cloud/aws/deadline";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type BudgetStatus = deadline.BudgetStatus;
export type BudgetActionType = deadline.BudgetActionType;
export interface BudgetActionProps {
    /**
     * Action taken when the threshold is crossed
     * (`STOP_SCHEDULING_AND_COMPLETE_TASKS` or
     * `STOP_SCHEDULING_AND_CANCEL_TASKS`).
     */
    type: BudgetActionType;
    /**
     * Percentage of the dollar limit at which the action fires (e.g. `100`).
     */
    thresholdPercentage: number;
    /**
     * A description of the action.
     */
    description?: string;
}
export interface BudgetScheduleProps {
    /**
     * Fixed budget window.
     */
    fixed: {
        /**
         * ISO-8601 start of the budget window (e.g. `2026-01-01T00:00:00Z`).
         */
        startTime: string;
        /**
         * ISO-8601 end of the budget window.
         */
        endTime: string;
    };
}
export interface BudgetProps {
    /**
     * The identifier of the farm the budget belongs to. Changing it replaces
     * the budget.
     */
    farmId: string;
    /**
     * The identifier of the queue whose usage the budget tracks. Changing it
     * replaces the budget.
     */
    queueId: string;
    /**
     * Display name of the budget.
     * @default ${app}-${stage}-${id}
     */
    displayName?: string;
    /**
     * A description of the budget.
     */
    description?: string;
    /**
     * Approximate dollar limit of the budget.
     */
    approximateDollarLimit: number;
    /**
     * Threshold actions taken as usage approaches the limit.
     */
    actions: BudgetActionProps[];
    /**
     * The period the budget is measured over.
     */
    schedule: BudgetScheduleProps;
    /**
     * Whether the budget is evaluated (`ACTIVE`) or ignored (`INACTIVE`).
     * @default "ACTIVE"
     */
    status?: BudgetStatus;
    /**
     * Tags to associate with the budget.
     */
    tags?: Record<string, string>;
}
export interface Budget extends Resource<"AWS.Deadline.Budget", BudgetProps, {
    /**
     * The identifier of the farm the budget belongs to.
     */
    farmId: string;
    /**
     * Service-assigned unique identifier of the budget (`budget-...`).
     */
    budgetId: string;
    /**
     * ARN of the budget.
     */
    budgetArn: string;
    /**
     * The identifier of the queue whose usage the budget tracks.
     */
    queueId: string;
    /**
     * The budget's display name.
     */
    displayName: string;
    /**
     * Whether the budget is currently evaluated.
     */
    status: BudgetStatus;
    /**
     * The configured approximate dollar limit.
     */
    approximateDollarLimit: number;
    /**
     * Current tags reported for the budget.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS Deadline Cloud budget — tracks a queue's approximate render spend
 * over a fixed window and stops scheduling when thresholds are crossed.
 *
 * ### Creating Budgets
 * **Example:** Queue Budget with Hard Stop
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const budget = yield* AWS.Deadline.Budget("MonthlyBudget", {
 *   farmId: farm.farmId,
 *   queueId: queue.queueId,
 *   approximateDollarLimit: 100,
 *   actions: [
 *     { type: "STOP_SCHEDULING_AND_COMPLETE_TASKS", thresholdPercentage: 100 },
 *   ],
 *   schedule: {
 *     fixed: {
 *       startTime: "2026-01-01T00:00:00Z",
 *       endTime: "2027-01-01T00:00:00Z",
 *     },
 *   },
 * });
 * ```
 *
 * **Example:** Graduated Thresholds
 * ```typescript
 * // Let in-flight tasks finish at 90%, cancel everything at 100%.
 * const budget = yield* AWS.Deadline.Budget("QueueBudget", {
 *   farmId: farm.farmId,
 *   queueId: queue.queueId,
 *   approximateDollarLimit: 500,
 *   actions: [
 *     { type: "STOP_SCHEDULING_AND_COMPLETE_TASKS", thresholdPercentage: 90 },
 *     { type: "STOP_SCHEDULING_AND_CANCEL_TASKS", thresholdPercentage: 100 },
 *   ],
 *   schedule: {
 *     fixed: {
 *       startTime: "2026-01-01T00:00:00Z",
 *       endTime: "2026-02-01T00:00:00Z",
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Budget: import("../../Resource.ts").ResourceClass<Budget>;
export declare const BudgetProvider: () => import("effect/Layer").Layer<Provider.Provider<Budget>, never, import("../Environment.ts").AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Budget.d.ts.map