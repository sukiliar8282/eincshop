import * as controltower from "@distilled.cloud/aws/controltower";
import * as Layer from "effect/Layer";
import { makeControlTowerAccountHttpBinding } from "./BindingHttp.js";
import { GetBaseline } from "./GetBaseline.js";
export const GetBaselineHttp = Layer.effect(GetBaseline, makeControlTowerAccountHttpBinding({
    capability: "GetBaseline",
    iamActions: ["controltower:GetBaseline"],
    operation: controltower.getBaseline,
}));
//# sourceMappingURL=GetBaselineHttp.js.map