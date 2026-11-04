import * as location from "@distilled.cloud/aws/location";
import * as Layer from "effect/Layer";
import { makeLocationMapHttpBinding } from "./BindingHttp.js";
import { GetMapTile } from "./GetMapTile.js";
export const GetMapTileHttp = Layer.effect(GetMapTile, makeLocationMapHttpBinding({
    tag: "AWS.Location.GetMapTile",
    operation: location.getMapTile,
    actions: ["geo:GetMapTile"],
}));
//# sourceMappingURL=GetMapTileHttp.js.map