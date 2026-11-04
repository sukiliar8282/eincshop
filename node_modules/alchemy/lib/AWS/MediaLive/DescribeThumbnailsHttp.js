import * as medialive from "@distilled.cloud/aws/medialive";
import * as Layer from "effect/Layer";
import { makeMediaLiveChannelHttpBinding } from "./BindingHttp.js";
import { DescribeThumbnails } from "./DescribeThumbnails.js";
export const DescribeThumbnailsHttp = Layer.effect(DescribeThumbnails, makeMediaLiveChannelHttpBinding({
    tag: "AWS.MediaLive.DescribeThumbnails",
    operation: medialive.describeThumbnails,
    actions: ["medialive:DescribeThumbnails"],
}));
//# sourceMappingURL=DescribeThumbnailsHttp.js.map