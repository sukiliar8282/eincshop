import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { StopStreamProcessor } from "./StopStreamProcessor.js";
export const StopStreamProcessorHttp = Layer.effect(StopStreamProcessor, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.StopStreamProcessor",
    operation: rekognition.stopStreamProcessor,
    actions: ["rekognition:StopStreamProcessor"],
}));
//# sourceMappingURL=StopStreamProcessorHttp.js.map