import * as Kinesis from "@distilled.cloud/aws/kinesis";
import * as Layer from "effect/Layer";
import { makeStreamHttpBinding } from "./BindingHttp.js";
import { DescribeStream } from "./DescribeStream.js";
export const DescribeStreamHttp = Layer.effect(DescribeStream, makeStreamHttpBinding({
    tag: "AWS.Kinesis.DescribeStream",
    operation: Kinesis.describeStream,
    actions: ["kinesis:DescribeStream"],
    key: "StreamARN",
}));
//# sourceMappingURL=DescribeStreamHttp.js.map