import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { GetTextDetection } from "./GetTextDetection.js";
export const GetTextDetectionHttp = Layer.effect(GetTextDetection, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.GetTextDetection",
    operation: rekognition.getTextDetection,
    actions: ["rekognition:GetTextDetection"],
}));
//# sourceMappingURL=GetTextDetectionHttp.js.map