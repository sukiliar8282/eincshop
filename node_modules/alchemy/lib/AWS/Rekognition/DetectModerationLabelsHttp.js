import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { DetectModerationLabels } from "./DetectModerationLabels.js";
export const DetectModerationLabelsHttp = Layer.effect(DetectModerationLabels, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.DetectModerationLabels",
    operation: rekognition.detectModerationLabels,
    actions: ["rekognition:DetectModerationLabels"],
}));
//# sourceMappingURL=DetectModerationLabelsHttp.js.map