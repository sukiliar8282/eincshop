import * as controltower from "@distilled.cloud/aws/controltower";
import * as Layer from "effect/Layer";
import { makeControlTowerHttpBinding } from "./BindingHttp.js";
import { GetEnabledBaseline } from "./GetEnabledBaseline.js";
export const GetEnabledBaselineHttp = Layer.effect(GetEnabledBaseline, makeControlTowerHttpBinding({
    capability: "GetEnabledBaseline",
    iamActions: ["controltower:GetEnabledBaseline"],
    requestKey: "enabledBaselineIdentifier",
    identifier: (enabledBaseline) => enabledBaseline.enabledBaselineArn,
    operation: controltower.getEnabledBaseline,
}));
//# sourceMappingURL=GetEnabledBaselineHttp.js.map