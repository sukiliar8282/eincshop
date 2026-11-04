import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { StartSegmentDetection } from "./StartSegmentDetection.js";
export const StartSegmentDetectionHttp = Layer.effect(StartSegmentDetection, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.StartSegmentDetection",
    operation: rekognition.startSegmentDetection,
    actions: ["rekognition:StartSegmentDetection"],
}));
//# sourceMappingURL=StartSegmentDetectionHttp.js.map