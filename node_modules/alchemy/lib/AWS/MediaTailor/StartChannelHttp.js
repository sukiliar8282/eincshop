import * as mediatailor from "@distilled.cloud/aws/mediatailor";
import * as Layer from "effect/Layer";
import { makeMediaTailorHttpBinding } from "./BindingHttp.js";
import { StartChannel } from "./StartChannel.js";
export const StartChannelHttp = Layer.effect(StartChannel, makeMediaTailorHttpBinding({
    capability: "StartChannel",
    iamActions: ["mediatailor:StartChannel"],
    operation: mediatailor.startChannel,
}));
//# sourceMappingURL=StartChannelHttp.js.map