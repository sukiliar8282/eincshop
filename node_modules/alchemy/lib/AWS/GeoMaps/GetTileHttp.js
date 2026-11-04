import * as geoMaps from "@distilled.cloud/aws/geo-maps";
import * as Layer from "effect/Layer";
import { makeGeoMapsHttpBinding } from "./BindingHttp.js";
import { GetTile } from "./GetTile.js";
export const GetTileHttp = Layer.effect(GetTile, makeGeoMapsHttpBinding({
    capability: "GetTile",
    iamActions: ["geo-maps:GetTile"],
    operation: geoMaps.getTile,
}));
//# sourceMappingURL=GetTileHttp.js.map