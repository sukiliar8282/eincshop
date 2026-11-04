import * as aiops from "@distilled.cloud/aws/aiops";
import * as Layer from "effect/Layer";
import { makeAIOpsGroupHttpBinding } from "./BindingHttp.js";
import { GetInvestigationGroup } from "./GetInvestigationGroup.js";
export const GetInvestigationGroupHttp = Layer.effect(GetInvestigationGroup, makeAIOpsGroupHttpBinding({
    tag: "AWS.AIOps.GetInvestigationGroup",
    operation: aiops.getInvestigationGroup,
    actions: ["aiops:GetInvestigationGroup"],
    input: (identifier) => ({ identifier }),
}));
//# sourceMappingURL=GetInvestigationGroupHttp.js.map