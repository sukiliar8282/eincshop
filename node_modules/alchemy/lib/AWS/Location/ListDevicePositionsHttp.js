import * as location from "@distilled.cloud/aws/location";
import * as Layer from "effect/Layer";
import { makeLocationTrackerHttpBinding } from "./BindingHttp.js";
import { ListDevicePositions } from "./ListDevicePositions.js";
export const ListDevicePositionsHttp = Layer.effect(ListDevicePositions, makeLocationTrackerHttpBinding({
    tag: "AWS.Location.ListDevicePositions",
    operation: location.listDevicePositions,
    actions: ["geo:ListDevicePositions"],
}));
//# sourceMappingURL=ListDevicePositionsHttp.js.map