import * as controltower from "@distilled.cloud/aws/controltower";
import * as Layer from "effect/Layer";
import { makeControlTowerAccountHttpBinding } from "./BindingHttp.js";
import { GetLandingZoneOperation } from "./GetLandingZoneOperation.js";
export const GetLandingZoneOperationHttp = Layer.effect(GetLandingZoneOperation, makeControlTowerAccountHttpBinding({
    capability: "GetLandingZoneOperation",
    iamActions: ["controltower:GetLandingZoneOperation"],
    operation: controltower.getLandingZoneOperation,
}));
//# sourceMappingURL=GetLandingZoneOperationHttp.js.map