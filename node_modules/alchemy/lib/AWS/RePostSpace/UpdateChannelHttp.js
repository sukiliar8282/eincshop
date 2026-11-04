import * as repostspace from "@distilled.cloud/aws/repostspace";
import * as Layer from "effect/Layer";
import { makeRePostSpaceHttpBinding } from "./BindingHttp.js";
import { UpdateChannel } from "./UpdateChannel.js";
export const UpdateChannelHttp = Layer.effect(UpdateChannel, makeRePostSpaceHttpBinding({
    tag: "AWS.RePostSpace.UpdateChannel",
    operation: repostspace.updateChannel,
    actions: ["repostspace:UpdateChannel"],
}));
//# sourceMappingURL=UpdateChannelHttp.js.map