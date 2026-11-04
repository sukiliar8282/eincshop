import * as aa from "@distilled.cloud/aws/accessanalyzer";
import * as Layer from "effect/Layer";
import { makeAnalyzerScopedHttpBinding } from "./BindingHttp.js";
import { GetAccessPreview } from "./GetAccessPreview.js";
export const GetAccessPreviewHttp = Layer.effect(GetAccessPreview, makeAnalyzerScopedHttpBinding({
    tag: "AWS.AccessAnalyzer.GetAccessPreview",
    operation: aa.getAccessPreview,
    actions: ["access-analyzer:GetAccessPreview"],
}));
//# sourceMappingURL=GetAccessPreviewHttp.js.map