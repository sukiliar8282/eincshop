import * as budgets from "@distilled.cloud/aws/budgets";
import * as Layer from "effect/Layer";
import { makeBudgetActionHttpBinding } from "./BindingHttp.js";
import { ExecuteBudgetAction } from "./ExecuteBudgetAction.js";
export const ExecuteBudgetActionHttp = Layer.effect(ExecuteBudgetAction, makeBudgetActionHttpBinding({
    tag: "AWS.Budgets.ExecuteBudgetAction",
    actions: ["budgets:ExecuteBudgetAction"],
    operation: budgets.executeBudgetAction,
}));
//# sourceMappingURL=ExecuteBudgetActionHttp.js.map