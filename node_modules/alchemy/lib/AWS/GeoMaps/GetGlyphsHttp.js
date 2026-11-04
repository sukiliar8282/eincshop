import * as geoMaps from "@distilled.cloud/aws/geo-maps";
import * as Layer from "effect/Layer";
import { makeGeoMapsHttpBinding } from "./BindingHttp.js";
import { GetGlyphs } from "./GetGlyphs.js";
export const GetGlyphsHttp = Layer.effect(GetGlyphs, makeGeoMapsHttpBinding({
    capability: "GetGlyphs",
    iamActions: ["geo-maps:GetGlyphs"],
    operation: geoMaps.getGlyphs,
}));
//# sourceMappingURL=GetGlyphsHttp.js.map