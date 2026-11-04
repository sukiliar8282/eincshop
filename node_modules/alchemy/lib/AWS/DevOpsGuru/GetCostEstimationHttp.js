import * as devopsguru from "@distilled.cloud/aws/devops-guru";
import * as Layer from "effect/Layer";
import { makeDevOpsGuruAccountHttpBinding } from "./BindingHttp.js";
import { GetCostEstimation } from "./GetCostEstimation.js";
export const GetCostEstimationHttp = Layer.effect(GetCostEstimation, makeDevOpsGuruAccountHttpBinding({
    tag: "AWS.DevOpsGuru.GetCostEstimation",
    operation: devopsguru.getCostEstimation,
    actions: ["devops-guru:GetCostEstimation"],
}));
//# sourceMappingURL=GetCostEstimationHttp.js.map