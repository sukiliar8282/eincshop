import * as aa from "@distilled.cloud/aws/accessanalyzer";
import * as Layer from "effect/Layer";
import { makeAnalyzerScopedHttpBinding } from "./BindingHttp.js";
import { GetFindingV2 } from "./GetFindingV2.js";
export const GetFindingV2Http = Layer.effect(GetFindingV2, makeAnalyzerScopedHttpBinding({
    tag: "AWS.AccessAnalyzer.GetFindingV2",
    operation: aa.getFindingV2,
    // GetFinding and GetFindingV2 both use `access-analyzer:GetFinding`.
    actions: ["access-analyzer:GetFinding"],
}));
//# sourceMappingURL=GetFindingV2Http.js.map