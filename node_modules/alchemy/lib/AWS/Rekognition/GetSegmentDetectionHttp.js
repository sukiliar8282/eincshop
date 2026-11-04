import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { GetSegmentDetection } from "./GetSegmentDetection.js";
export const GetSegmentDetectionHttp = Layer.effect(GetSegmentDetection, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.GetSegmentDetection",
    operation: rekognition.getSegmentDetection,
    actions: ["rekognition:GetSegmentDetection"],
}));
//# sourceMappingURL=GetSegmentDetectionHttp.js.map