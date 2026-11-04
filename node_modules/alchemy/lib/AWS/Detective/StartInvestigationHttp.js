import * as detective from "@distilled.cloud/aws/detective";
import * as Layer from "effect/Layer";
import { makeDetectiveGraphHttpBinding } from "./BindingHttp.js";
import { StartInvestigation } from "./StartInvestigation.js";
export const StartInvestigationHttp = Layer.effect(StartInvestigation, makeDetectiveGraphHttpBinding({
    tag: "AWS.Detective.StartInvestigation",
    operation: detective.startInvestigation,
    actions: ["detective:StartInvestigation"],
}));
//# sourceMappingURL=StartInvestigationHttp.js.map