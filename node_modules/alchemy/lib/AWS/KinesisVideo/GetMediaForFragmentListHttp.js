import * as kvam from "@distilled.cloud/aws/kinesis-video-archived-media";
import * as Layer from "effect/Layer";
import { makeStreamMediaHttpBinding } from "./BindingHttp.js";
import { GetMediaForFragmentList } from "./GetMediaForFragmentList.js";
export const GetMediaForFragmentListHttp = Layer.effect(GetMediaForFragmentList, makeStreamMediaHttpBinding({
    tag: "AWS.KinesisVideo.GetMediaForFragmentList",
    apiName: "GET_MEDIA_FOR_FRAGMENT_LIST",
    actions: ["kinesisvideo:GetMediaForFragmentList"],
    operation: kvam.getMediaForFragmentList,
}));
//# sourceMappingURL=GetMediaForFragmentListHttp.js.map