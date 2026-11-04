import * as aa from "@distilled.cloud/aws/accessanalyzer";
import * as Layer from "effect/Layer";
import { makeAnalyzerScopedHttpBinding } from "./BindingHttp.js";
import { GetFinding } from "./GetFinding.js";
export const GetFindingHttp = Layer.effect(GetFinding, makeAnalyzerScopedHttpBinding({
    tag: "AWS.AccessAnalyzer.GetFinding",
    operation: aa.getFinding,
    actions: ["access-analyzer:GetFinding"],
}));
//# sourceMappingURL=GetFindingHttp.js.map