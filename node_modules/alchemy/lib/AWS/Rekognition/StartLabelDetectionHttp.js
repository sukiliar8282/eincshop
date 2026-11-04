import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { StartLabelDetection } from "./StartLabelDetection.js";
export const StartLabelDetectionHttp = Layer.effect(StartLabelDetection, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.StartLabelDetection",
    operation: rekognition.startLabelDetection,
    actions: ["rekognition:StartLabelDetection"],
}));
//# sourceMappingURL=StartLabelDetectionHttp.js.map