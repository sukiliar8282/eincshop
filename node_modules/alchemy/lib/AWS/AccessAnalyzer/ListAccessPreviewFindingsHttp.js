import * as aa from "@distilled.cloud/aws/accessanalyzer";
import * as Layer from "effect/Layer";
import { makeAnalyzerScopedHttpBinding } from "./BindingHttp.js";
import { ListAccessPreviewFindings } from "./ListAccessPreviewFindings.js";
export const ListAccessPreviewFindingsHttp = Layer.effect(ListAccessPreviewFindings, makeAnalyzerScopedHttpBinding({
    tag: "AWS.AccessAnalyzer.ListAccessPreviewFindings",
    operation: aa.listAccessPreviewFindings,
    actions: ["access-analyzer:ListAccessPreviewFindings"],
}));
//# sourceMappingURL=ListAccessPreviewFindingsHttp.js.map