import * as fis from "@distilled.cloud/aws/fis";
import * as Layer from "effect/Layer";
import { makeFisAccountHttpBinding } from "./BindingHttp.js";
import { UpdateSafetyLeverState } from "./UpdateSafetyLeverState.js";
export const UpdateSafetyLeverStateHttp = Layer.effect(UpdateSafetyLeverState, makeFisAccountHttpBinding({
    tag: "AWS.FIS.UpdateSafetyLeverState",
    operation: fis.updateSafetyLeverState,
    actions: ["fis:UpdateSafetyLeverState"],
}));
//# sourceMappingURL=UpdateSafetyLeverStateHttp.js.map