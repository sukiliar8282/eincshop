import * as location from "@distilled.cloud/aws/location";
import * as Layer from "effect/Layer";
import { makeLocationMapHttpBinding } from "./BindingHttp.js";
import { GetMapGlyphs } from "./GetMapGlyphs.js";
export const GetMapGlyphsHttp = Layer.effect(GetMapGlyphs, makeLocationMapHttpBinding({
    tag: "AWS.Location.GetMapGlyphs",
    operation: location.getMapGlyphs,
    actions: ["geo:GetMapGlyphs"],
}));
//# sourceMappingURL=GetMapGlyphsHttp.js.map