import * as kvm from "@distilled.cloud/aws/kinesis-video-media";
import * as Layer from "effect/Layer";
import { makeStreamMediaHttpBinding } from "./BindingHttp.js";
import { GetMedia } from "./GetMedia.js";
export const GetMediaHttp = Layer.effect(GetMedia, makeStreamMediaHttpBinding({
    tag: "AWS.KinesisVideo.GetMedia",
    apiName: "GET_MEDIA",
    actions: ["kinesisvideo:GetMedia"],
    operation: kvm.getMedia,
}));
//# sourceMappingURL=GetMediaHttp.js.map