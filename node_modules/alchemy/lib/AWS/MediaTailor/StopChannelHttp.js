import * as mediatailor from "@distilled.cloud/aws/mediatailor";
import * as Layer from "effect/Layer";
import { makeMediaTailorHttpBinding } from "./BindingHttp.js";
import { StopChannel } from "./StopChannel.js";
export const StopChannelHttp = Layer.effect(StopChannel, makeMediaTailorHttpBinding({
    capability: "StopChannel",
    iamActions: ["mediatailor:StopChannel"],
    operation: mediatailor.stopChannel,
}));
//# sourceMappingURL=StopChannelHttp.js.map