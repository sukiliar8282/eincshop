import * as controltower from "@distilled.cloud/aws/controltower";
import * as Layer from "effect/Layer";
import { makeControlTowerHttpBinding } from "./BindingHttp.js";
import { GetEnabledControl } from "./GetEnabledControl.js";
export const GetEnabledControlHttp = Layer.effect(GetEnabledControl, makeControlTowerHttpBinding({
    capability: "GetEnabledControl",
    iamActions: ["controltower:GetEnabledControl"],
    requestKey: "enabledControlIdentifier",
    identifier: (enabledControl) => enabledControl.enabledControlArn,
    operation: controltower.getEnabledControl,
}));
//# sourceMappingURL=GetEnabledControlHttp.js.map