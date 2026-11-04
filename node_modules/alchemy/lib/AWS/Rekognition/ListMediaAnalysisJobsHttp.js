import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { ListMediaAnalysisJobs } from "./ListMediaAnalysisJobs.js";
export const ListMediaAnalysisJobsHttp = Layer.effect(ListMediaAnalysisJobs, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.ListMediaAnalysisJobs",
    operation: rekognition.listMediaAnalysisJobs,
    actions: ["rekognition:ListMediaAnalysisJobs"],
}));
//# sourceMappingURL=ListMediaAnalysisJobsHttp.js.map