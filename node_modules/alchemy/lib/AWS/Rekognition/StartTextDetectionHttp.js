import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { StartTextDetection } from "./StartTextDetection.js";
export const StartTextDetectionHttp = Layer.effect(StartTextDetection, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.StartTextDetection",
    operation: rekognition.startTextDetection,
    actions: ["rekognition:StartTextDetection"],
}));
//# sourceMappingURL=StartTextDetectionHttp.js.map