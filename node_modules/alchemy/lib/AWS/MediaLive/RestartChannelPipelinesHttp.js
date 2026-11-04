import * as medialive from "@distilled.cloud/aws/medialive";
import * as Layer from "effect/Layer";
import { makeMediaLiveChannelHttpBinding } from "./BindingHttp.js";
import { RestartChannelPipelines } from "./RestartChannelPipelines.js";
export const RestartChannelPipelinesHttp = Layer.effect(RestartChannelPipelines, makeMediaLiveChannelHttpBinding({
    tag: "AWS.MediaLive.RestartChannelPipelines",
    operation: medialive.restartChannelPipelines,
    actions: ["medialive:RestartChannelPipelines"],
}));
//# sourceMappingURL=RestartChannelPipelinesHttp.js.map