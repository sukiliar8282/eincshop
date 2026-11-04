import * as Kinesis from "@distilled.cloud/aws/kinesis";
import * as Layer from "effect/Layer";
import { makeConsumerHttpBinding } from "./BindingHttp.js";
import { DescribeStreamConsumer } from "./DescribeStreamConsumer.js";
export const DescribeStreamConsumerHttp = Layer.effect(DescribeStreamConsumer, makeConsumerHttpBinding({
    tag: "AWS.Kinesis.DescribeStreamConsumer",
    operation: Kinesis.describeStreamConsumer,
    actions: ["kinesis:DescribeStreamConsumer"],
}));
//# sourceMappingURL=DescribeStreamConsumerHttp.js.map