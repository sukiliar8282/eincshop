import * as detective from "@distilled.cloud/aws/detective";
import * as Layer from "effect/Layer";
import { makeDetectiveGraphHttpBinding } from "./BindingHttp.js";
import { UpdateInvestigationState } from "./UpdateInvestigationState.js";
export const UpdateInvestigationStateHttp = Layer.effect(UpdateInvestigationState, makeDetectiveGraphHttpBinding({
    tag: "AWS.Detective.UpdateInvestigationState",
    operation: detective.updateInvestigationState,
    actions: ["detective:UpdateInvestigationState"],
}));
//# sourceMappingURL=UpdateInvestigationStateHttp.js.map