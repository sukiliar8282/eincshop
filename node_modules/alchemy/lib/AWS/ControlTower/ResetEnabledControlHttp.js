import * as controltower from "@distilled.cloud/aws/controltower";
import * as Layer from "effect/Layer";
import { makeControlTowerHttpBinding } from "./BindingHttp.js";
import { ResetEnabledControl } from "./ResetEnabledControl.js";
export const ResetEnabledControlHttp = Layer.effect(ResetEnabledControl, makeControlTowerHttpBinding({
    capability: "ResetEnabledControl",
    iamActions: ["controltower:ResetEnabledControl"],
    requestKey: "enabledControlIdentifier",
    identifier: (enabledControl) => enabledControl.enabledControlArn,
    operation: controltower.resetEnabledControl,
}));
//# sourceMappingURL=ResetEnabledControlHttp.js.map