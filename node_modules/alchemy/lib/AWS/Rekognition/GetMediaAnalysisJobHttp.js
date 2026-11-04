import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { GetMediaAnalysisJob } from "./GetMediaAnalysisJob.js";
export const GetMediaAnalysisJobHttp = Layer.effect(GetMediaAnalysisJob, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.GetMediaAnalysisJob",
    operation: rekognition.getMediaAnalysisJob,
    actions: ["rekognition:GetMediaAnalysisJob"],
}));
//# sourceMappingURL=GetMediaAnalysisJobHttp.js.map