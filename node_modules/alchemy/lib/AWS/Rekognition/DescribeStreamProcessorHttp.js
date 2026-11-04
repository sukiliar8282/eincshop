import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { DescribeStreamProcessor } from "./DescribeStreamProcessor.js";
export const DescribeStreamProcessorHttp = Layer.effect(DescribeStreamProcessor, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.DescribeStreamProcessor",
    operation: rekognition.describeStreamProcessor,
    actions: ["rekognition:DescribeStreamProcessor"],
}));
//# sourceMappingURL=DescribeStreamProcessorHttp.js.map