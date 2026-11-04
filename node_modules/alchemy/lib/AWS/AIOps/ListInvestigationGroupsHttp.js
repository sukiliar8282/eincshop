import * as aiops from "@distilled.cloud/aws/aiops";
import * as Layer from "effect/Layer";
import { makeAIOpsAccountHttpBinding } from "./BindingHttp.js";
import { ListInvestigationGroups } from "./ListInvestigationGroups.js";
export const ListInvestigationGroupsHttp = Layer.effect(ListInvestigationGroups, makeAIOpsAccountHttpBinding({
    tag: "AWS.AIOps.ListInvestigationGroups",
    operation: aiops.listInvestigationGroups,
    actions: ["aiops:ListInvestigationGroups"],
}));
//# sourceMappingURL=ListInvestigationGroupsHttp.js.map