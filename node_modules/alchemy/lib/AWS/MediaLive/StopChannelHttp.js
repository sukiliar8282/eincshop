import * as medialive from "@distilled.cloud/aws/medialive";
import * as Layer from "effect/Layer";
import { makeMediaLiveChannelHttpBinding } from "./BindingHttp.js";
import { StopChannel } from "./StopChannel.js";
export const StopChannelHttp = Layer.effect(StopChannel, makeMediaLiveChannelHttpBinding({
    tag: "AWS.MediaLive.StopChannel",
    operation: medialive.stopChannel,
    actions: ["medialive:StopChannel"],
}));
//# sourceMappingURL=StopChannelHttp.js.map