import * as aa from "@distilled.cloud/aws/accessanalyzer";
import * as Layer from "effect/Layer";
import { makeAccessAnalyzerAccountHttpBinding } from "./BindingHttp.js";
import { GetGeneratedPolicy } from "./GetGeneratedPolicy.js";
export const GetGeneratedPolicyHttp = Layer.effect(GetGeneratedPolicy, makeAccessAnalyzerAccountHttpBinding({
    tag: "AWS.AccessAnalyzer.GetGeneratedPolicy",
    operation: aa.getGeneratedPolicy,
    actions: ["access-analyzer:GetGeneratedPolicy"],
}));
//# sourceMappingURL=GetGeneratedPolicyHttp.js.map