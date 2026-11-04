import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { GetFaceDetection } from "./GetFaceDetection.js";
export const GetFaceDetectionHttp = Layer.effect(GetFaceDetection, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.GetFaceDetection",
    operation: rekognition.getFaceDetection,
    actions: ["rekognition:GetFaceDetection"],
}));
//# sourceMappingURL=GetFaceDetectionHttp.js.map