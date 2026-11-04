import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { GetLabelDetection } from "./GetLabelDetection.js";
export const GetLabelDetectionHttp = Layer.effect(GetLabelDetection, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.GetLabelDetection",
    operation: rekognition.getLabelDetection,
    actions: ["rekognition:GetLabelDetection"],
}));
//# sourceMappingURL=GetLabelDetectionHttp.js.map