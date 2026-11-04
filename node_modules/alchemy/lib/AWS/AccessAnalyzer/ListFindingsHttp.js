import * as aa from "@distilled.cloud/aws/accessanalyzer";
import * as Layer from "effect/Layer";
import { makeAnalyzerScopedHttpBinding } from "./BindingHttp.js";
import { ListFindings } from "./ListFindings.js";
export const ListFindingsHttp = Layer.effect(ListFindings, makeAnalyzerScopedHttpBinding({
    tag: "AWS.AccessAnalyzer.ListFindings",
    operation: aa.listFindings,
    actions: ["access-analyzer:ListFindings"],
}));
//# sourceMappingURL=ListFindingsHttp.js.map