import * as controltower from "@distilled.cloud/aws/controltower";
import * as Layer from "effect/Layer";
import { makeControlTowerHttpBinding } from "./BindingHttp.js";
import { ResetLandingZone } from "./ResetLandingZone.js";
export const ResetLandingZoneHttp = Layer.effect(ResetLandingZone, makeControlTowerHttpBinding({
    capability: "ResetLandingZone",
    iamActions: ["controltower:ResetLandingZone"],
    requestKey: "landingZoneIdentifier",
    identifier: (landingZone) => landingZone.landingZoneArn,
    operation: controltower.resetLandingZone,
}));
//# sourceMappingURL=ResetLandingZoneHttp.js.map