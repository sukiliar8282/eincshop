import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { StartFaceDetection } from "./StartFaceDetection.js";
export const StartFaceDetectionHttp = Layer.effect(StartFaceDetection, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.StartFaceDetection",
    operation: rekognition.startFaceDetection,
    actions: ["rekognition:StartFaceDetection"],
}));
//# sourceMappingURL=StartFaceDetectionHttp.js.map