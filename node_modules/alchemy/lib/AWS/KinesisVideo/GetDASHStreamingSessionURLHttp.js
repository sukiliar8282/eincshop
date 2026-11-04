import * as kvam from "@distilled.cloud/aws/kinesis-video-archived-media";
import * as Layer from "effect/Layer";
import { makeStreamMediaHttpBinding } from "./BindingHttp.js";
import { GetDASHStreamingSessionURL } from "./GetDASHStreamingSessionURL.js";
export const GetDASHStreamingSessionURLHttp = Layer.effect(GetDASHStreamingSessionURL, makeStreamMediaHttpBinding({
    tag: "AWS.KinesisVideo.GetDASHStreamingSessionURL",
    apiName: "GET_DASH_STREAMING_SESSION_URL",
    actions: ["kinesisvideo:GetDASHStreamingSessionURL"],
    operation: kvam.getDASHStreamingSessionURL,
}));
//# sourceMappingURL=GetDASHStreamingSessionURLHttp.js.map