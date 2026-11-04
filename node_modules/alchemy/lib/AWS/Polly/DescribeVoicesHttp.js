import * as polly from "@distilled.cloud/aws/polly";
import * as Layer from "effect/Layer";
import { makePollyHttpBinding } from "./BindingHttp.js";
import { DescribeVoices } from "./DescribeVoices.js";
export const DescribeVoicesHttp = Layer.effect(DescribeVoices, makePollyHttpBinding({
    capability: "DescribeVoices",
    iamActions: ["polly:DescribeVoices"],
    operation: polly.describeVoices,
}));
//# sourceMappingURL=DescribeVoicesHttp.js.map