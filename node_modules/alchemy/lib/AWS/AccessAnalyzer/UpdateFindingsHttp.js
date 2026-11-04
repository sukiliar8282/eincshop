import * as aa from "@distilled.cloud/aws/accessanalyzer";
import * as Layer from "effect/Layer";
import { makeAnalyzerScopedHttpBinding } from "./BindingHttp.js";
import { UpdateFindings } from "./UpdateFindings.js";
export const UpdateFindingsHttp = Layer.effect(UpdateFindings, makeAnalyzerScopedHttpBinding({
    tag: "AWS.AccessAnalyzer.UpdateFindings",
    operation: aa.updateFindings,
    actions: ["access-analyzer:UpdateFindings"],
}));
//# sourceMappingURL=UpdateFindingsHttp.js.map