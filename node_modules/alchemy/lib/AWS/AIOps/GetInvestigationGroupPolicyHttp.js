import * as aiops from "@distilled.cloud/aws/aiops";
import * as Layer from "effect/Layer";
import { makeAIOpsGroupHttpBinding } from "./BindingHttp.js";
import { GetInvestigationGroupPolicy } from "./GetInvestigationGroupPolicy.js";
export const GetInvestigationGroupPolicyHttp = Layer.effect(GetInvestigationGroupPolicy, makeAIOpsGroupHttpBinding({
    tag: "AWS.AIOps.GetInvestigationGroupPolicy",
    operation: aiops.getInvestigationGroupPolicy,
    actions: ["aiops:GetInvestigationGroupPolicy"],
    input: (identifier) => ({ identifier }),
}));
//# sourceMappingURL=GetInvestigationGroupPolicyHttp.js.map