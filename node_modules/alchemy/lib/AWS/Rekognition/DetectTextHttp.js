import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { DetectText } from "./DetectText.js";
export const DetectTextHttp = Layer.effect(DetectText, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.DetectText",
    operation: rekognition.detectText,
    actions: ["rekognition:DetectText"],
}));
//# sourceMappingURL=DetectTextHttp.js.map