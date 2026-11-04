import * as location from "@distilled.cloud/aws/location";
import * as Layer from "effect/Layer";
import { makeLocationTrackerHttpBinding } from "./BindingHttp.js";
import { VerifyDevicePosition } from "./VerifyDevicePosition.js";
export const VerifyDevicePositionHttp = Layer.effect(VerifyDevicePosition, makeLocationTrackerHttpBinding({
    tag: "AWS.Location.VerifyDevicePosition",
    operation: location.verifyDevicePosition,
    actions: ["geo:VerifyDevicePosition"],
}));
//# sourceMappingURL=VerifyDevicePositionHttp.js.map