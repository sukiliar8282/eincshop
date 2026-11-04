import * as cloudwatch from "@distilled.cloud/aws/cloudwatch";
import * as Layer from "effect/Layer";
import { makeCloudWatchAccountHttpBinding } from "./BindingHttp.js";
import { ListManagedInsightRules } from "./ListManagedInsightRules.js";
export const ListManagedInsightRulesHttp = Layer.effect(ListManagedInsightRules, makeCloudWatchAccountHttpBinding({
    tag: "AWS.CloudWatch.ListManagedInsightRules",
    operation: cloudwatch.listManagedInsightRules,
    actions: ["cloudwatch:ListManagedInsightRules"],
}));
//# sourceMappingURL=ListManagedInsightRulesHttp.js.map