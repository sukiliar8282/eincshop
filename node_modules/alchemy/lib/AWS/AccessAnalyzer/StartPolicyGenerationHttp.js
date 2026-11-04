import * as aa from "@distilled.cloud/aws/accessanalyzer";
import * as Layer from "effect/Layer";
import { makeAccessAnalyzerAccountHttpBinding } from "./BindingHttp.js";
import { StartPolicyGeneration } from "./StartPolicyGeneration.js";
export const StartPolicyGenerationHttp = Layer.effect(StartPolicyGeneration, makeAccessAnalyzerAccountHttpBinding({
    tag: "AWS.AccessAnalyzer.StartPolicyGeneration",
    operation: aa.startPolicyGeneration,
    actions: ["access-analyzer:StartPolicyGeneration"],
}));
//# sourceMappingURL=StartPolicyGenerationHttp.js.map