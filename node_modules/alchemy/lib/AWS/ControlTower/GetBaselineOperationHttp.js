import * as controltower from "@distilled.cloud/aws/controltower";
import * as Layer from "effect/Layer";
import { makeControlTowerAccountHttpBinding } from "./BindingHttp.js";
import { GetBaselineOperation } from "./GetBaselineOperation.js";
export const GetBaselineOperationHttp = Layer.effect(GetBaselineOperation, makeControlTowerAccountHttpBinding({
    capability: "GetBaselineOperation",
    iamActions: ["controltower:GetBaselineOperation"],
    operation: controltower.getBaselineOperation,
}));
//# sourceMappingURL=GetBaselineOperationHttp.js.map