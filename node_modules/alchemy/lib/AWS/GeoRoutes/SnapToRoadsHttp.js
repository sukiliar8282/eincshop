import * as geoRoutes from "@distilled.cloud/aws/geo-routes";
import * as Layer from "effect/Layer";
import { makeGeoRoutesHttpBinding } from "./BindingHttp.js";
import { SnapToRoads } from "./SnapToRoads.js";
export const SnapToRoadsHttp = Layer.effect(SnapToRoads, makeGeoRoutesHttpBinding({
    capability: "SnapToRoads",
    iamActions: ["geo-routes:SnapToRoads"],
    operation: geoRoutes.snapToRoads,
}));
//# sourceMappingURL=SnapToRoadsHttp.js.map