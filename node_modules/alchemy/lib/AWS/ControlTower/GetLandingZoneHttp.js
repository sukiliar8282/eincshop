import * as controltower from "@distilled.cloud/aws/controltower";
import * as Layer from "effect/Layer";
import { makeControlTowerAccountHttpBinding } from "./BindingHttp.js";
import { GetLandingZone } from "./GetLandingZone.js";
export const GetLandingZoneHttp = Layer.effect(GetLandingZone, makeControlTowerAccountHttpBinding({
    capability: "GetLandingZone",
    iamActions: ["controltower:GetLandingZone"],
    operation: controltower.getLandingZone,
}));
//# sourceMappingURL=GetLandingZoneHttp.js.map