import * as budgets from "@distilled.cloud/aws/budgets";
import * as Layer from "effect/Layer";
import { makeBudgetHttpBinding } from "./BindingHttp.js";
import { DescribeSubscribersForNotification } from "./DescribeSubscribersForNotification.js";
export const DescribeSubscribersForNotificationHttp = Layer.effect(DescribeSubscribersForNotification, makeBudgetHttpBinding({
    tag: "AWS.Budgets.DescribeSubscribersForNotification",
    actions: ["budgets:ViewBudget"],
    operation: budgets.describeSubscribersForNotification,
}));
//# sourceMappingURL=DescribeSubscribersForNotificationHttp.js.map