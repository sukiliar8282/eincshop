import * as location from "@distilled.cloud/aws/location";
import * as Layer from "effect/Layer";
import { makeLocationMapHttpBinding } from "./BindingHttp.js";
import { GetMapSprites } from "./GetMapSprites.js";
export const GetMapSpritesHttp = Layer.effect(GetMapSprites, makeLocationMapHttpBinding({
    tag: "AWS.Location.GetMapSprites",
    operation: location.getMapSprites,
    actions: ["geo:GetMapSprites"],
}));
//# sourceMappingURL=GetMapSpritesHttp.js.map