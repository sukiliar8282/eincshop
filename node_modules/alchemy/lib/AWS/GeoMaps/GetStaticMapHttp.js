import * as geoMaps from "@distilled.cloud/aws/geo-maps";
import * as Layer from "effect/Layer";
import { makeGeoMapsHttpBinding } from "./BindingHttp.js";
import { GetStaticMap } from "./GetStaticMap.js";
export const GetStaticMapHttp = Layer.effect(GetStaticMap, makeGeoMapsHttpBinding({
    capability: "GetStaticMap",
    iamActions: ["geo-maps:GetStaticMap"],
    operation: geoMaps.getStaticMap,
}));
//# sourceMappingURL=GetStaticMapHttp.js.map