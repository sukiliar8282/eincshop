import * as kvam from "@distilled.cloud/aws/kinesis-video-archived-media";
import * as Layer from "effect/Layer";
import { makeStreamMediaHttpBinding } from "./BindingHttp.js";
import { GetImages } from "./GetImages.js";
export const GetImagesHttp = Layer.effect(GetImages, makeStreamMediaHttpBinding({
    tag: "AWS.KinesisVideo.GetImages",
    apiName: "GET_IMAGES",
    actions: ["kinesisvideo:GetImages"],
    operation: kvam.getImages,
}));
//# sourceMappingURL=GetImagesHttp.js.map