import * as detective from "@distilled.cloud/aws/detective";
import * as Layer from "effect/Layer";
import { makeDetectiveGraphHttpBinding } from "./BindingHttp.js";
import { ListInvestigations } from "./ListInvestigations.js";
export const ListInvestigationsHttp = Layer.effect(ListInvestigations, makeDetectiveGraphHttpBinding({
    tag: "AWS.Detective.ListInvestigations",
    operation: detective.listInvestigations,
    actions: ["detective:ListInvestigations"],
}));
//# sourceMappingURL=ListInvestigationsHttp.js.map