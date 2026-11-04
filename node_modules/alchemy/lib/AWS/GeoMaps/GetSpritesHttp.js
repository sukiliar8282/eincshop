import * as geoMaps from "@distilled.cloud/aws/geo-maps";
import * as Layer from "effect/Layer";
import { makeGeoMapsHttpBinding } from "./BindingHttp.js";
import { GetSprites } from "./GetSprites.js";
export const GetSpritesHttp = Layer.effect(GetSprites, makeGeoMapsHttpBinding({
    capability: "GetSprites",
    iamActions: ["geo-maps:GetSprites"],
    operation: geoMaps.getSprites,
}));
//# sourceMappingURL=GetSpritesHttp.js.map