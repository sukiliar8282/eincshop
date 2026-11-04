import * as repostspace from "@distilled.cloud/aws/repostspace";
import * as Layer from "effect/Layer";
import { makeRePostSpaceHttpBinding } from "./BindingHttp.js";
import { GetChannel } from "./GetChannel.js";
export const GetChannelHttp = Layer.effect(GetChannel, makeRePostSpaceHttpBinding({
    tag: "AWS.RePostSpace.GetChannel",
    operation: repostspace.getChannel,
    actions: ["repostspace:GetChannel"],
}));
//# sourceMappingURL=GetChannelHttp.js.map