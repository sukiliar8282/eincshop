import * as controltower from "@distilled.cloud/aws/controltower";
import * as Layer from "effect/Layer";
import { makeControlTowerHttpBinding } from "./BindingHttp.js";
import { ResetEnabledBaseline } from "./ResetEnabledBaseline.js";
export const ResetEnabledBaselineHttp = Layer.effect(ResetEnabledBaseline, makeControlTowerHttpBinding({
    capability: "ResetEnabledBaseline",
    iamActions: ["controltower:ResetEnabledBaseline"],
    requestKey: "enabledBaselineIdentifier",
    identifier: (enabledBaseline) => enabledBaseline.enabledBaselineArn,
    operation: controltower.resetEnabledBaseline,
}));
//# sourceMappingURL=ResetEnabledBaselineHttp.js.map