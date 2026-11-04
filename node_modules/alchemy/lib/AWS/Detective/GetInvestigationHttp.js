import * as detective from "@distilled.cloud/aws/detective";
import * as Layer from "effect/Layer";
import { makeDetectiveGraphHttpBinding } from "./BindingHttp.js";
import { GetInvestigation } from "./GetInvestigation.js";
export const GetInvestigationHttp = Layer.effect(GetInvestigation, makeDetectiveGraphHttpBinding({
    tag: "AWS.Detective.GetInvestigation",
    operation: detective.getInvestigation,
    actions: ["detective:GetInvestigation"],
}));
//# sourceMappingURL=GetInvestigationHttp.js.map