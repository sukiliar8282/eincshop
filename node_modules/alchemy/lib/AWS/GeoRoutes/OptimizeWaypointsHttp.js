import * as geoRoutes from "@distilled.cloud/aws/geo-routes";
import * as Layer from "effect/Layer";
import { makeGeoRoutesHttpBinding } from "./BindingHttp.js";
import { OptimizeWaypoints } from "./OptimizeWaypoints.js";
export const OptimizeWaypointsHttp = Layer.effect(OptimizeWaypoints, makeGeoRoutesHttpBinding({
    capability: "OptimizeWaypoints",
    iamActions: ["geo-routes:OptimizeWaypoints"],
    operation: geoRoutes.optimizeWaypoints,
}));
//# sourceMappingURL=OptimizeWaypointsHttp.js.map