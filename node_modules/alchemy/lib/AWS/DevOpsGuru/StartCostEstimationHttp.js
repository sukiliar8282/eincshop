import * as devopsguru from "@distilled.cloud/aws/devops-guru";
import * as Layer from "effect/Layer";
import { makeDevOpsGuruAccountHttpBinding } from "./BindingHttp.js";
import { StartCostEstimation } from "./StartCostEstimation.js";
export const StartCostEstimationHttp = Layer.effect(StartCostEstimation, makeDevOpsGuruAccountHttpBinding({
    tag: "AWS.DevOpsGuru.StartCostEstimation",
    operation: devopsguru.startCostEstimation,
    actions: ["devops-guru:StartCostEstimation"],
}));
//# sourceMappingURL=StartCostEstimationHttp.js.map