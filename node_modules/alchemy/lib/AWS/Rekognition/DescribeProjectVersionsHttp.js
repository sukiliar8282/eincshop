import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { DescribeProjectVersions } from "./DescribeProjectVersions.js";
export const DescribeProjectVersionsHttp = Layer.effect(DescribeProjectVersions, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.DescribeProjectVersions",
    operation: rekognition.describeProjectVersions,
    actions: ["rekognition:DescribeProjectVersions"],
}));
//# sourceMappingURL=DescribeProjectVersionsHttp.js.map