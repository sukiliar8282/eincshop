import * as medialive from "@distilled.cloud/aws/medialive";
import * as Layer from "effect/Layer";
import { makeMediaLiveChannelHttpBinding } from "./BindingHttp.js";
import { StartChannel } from "./StartChannel.js";
export const StartChannelHttp = Layer.effect(StartChannel, makeMediaLiveChannelHttpBinding({
    tag: "AWS.MediaLive.StartChannel",
    operation: medialive.startChannel,
    actions: ["medialive:StartChannel"],
}));
//# sourceMappingURL=StartChannelHttp.js.map