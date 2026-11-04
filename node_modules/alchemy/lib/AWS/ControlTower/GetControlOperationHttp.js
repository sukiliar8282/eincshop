import * as controltower from "@distilled.cloud/aws/controltower";
import * as Layer from "effect/Layer";
import { makeControlTowerAccountHttpBinding } from "./BindingHttp.js";
import { GetControlOperation } from "./GetControlOperation.js";
export const GetControlOperationHttp = Layer.effect(GetControlOperation, makeControlTowerAccountHttpBinding({
    capability: "GetControlOperation",
    iamActions: ["controltower:GetControlOperation"],
    operation: controltower.getControlOperation,
}));
//# sourceMappingURL=GetControlOperationHttp.js.map