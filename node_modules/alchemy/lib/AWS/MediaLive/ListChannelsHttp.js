import * as medialive from "@distilled.cloud/aws/medialive";
import * as Layer from "effect/Layer";
import { makeMediaLiveAccountHttpBinding } from "./BindingHttp.js";
import { ListChannels } from "./ListChannels.js";
export const ListChannelsHttp = Layer.effect(ListChannels, makeMediaLiveAccountHttpBinding({
    tag: "AWS.MediaLive.ListChannels",
    operation: medialive.listChannels,
    actions: ["medialive:ListChannels"],
}));
//# sourceMappingURL=ListChannelsHttp.js.map