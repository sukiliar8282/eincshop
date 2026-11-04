import * as aa from "@distilled.cloud/aws/accessanalyzer";
import * as Layer from "effect/Layer";
import { makeAccessAnalyzerAccountHttpBinding } from "./BindingHttp.js";
import { ListPolicyGenerations } from "./ListPolicyGenerations.js";
export const ListPolicyGenerationsHttp = Layer.effect(ListPolicyGenerations, makeAccessAnalyzerAccountHttpBinding({
    tag: "AWS.AccessAnalyzer.ListPolicyGenerations",
    operation: aa.listPolicyGenerations,
    actions: ["access-analyzer:ListPolicyGenerations"],
}));
//# sourceMappingURL=ListPolicyGenerationsHttp.js.map