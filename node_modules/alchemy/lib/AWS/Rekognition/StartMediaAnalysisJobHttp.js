import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { StartMediaAnalysisJob } from "./StartMediaAnalysisJob.js";
export const StartMediaAnalysisJobHttp = Layer.effect(StartMediaAnalysisJob, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.StartMediaAnalysisJob",
    operation: rekognition.startMediaAnalysisJob,
    actions: ["rekognition:StartMediaAnalysisJob"],
}));
//# sourceMappingURL=StartMediaAnalysisJobHttp.js.map