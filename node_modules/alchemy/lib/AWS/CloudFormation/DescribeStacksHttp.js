import * as cloudformation from "@distilled.cloud/aws/cloudformation";
import * as Layer from "effect/Layer";
import { makeCloudFormationStackHttpBinding } from "./BindingHttp.js";
import { DescribeStacks } from "./DescribeStacks.js";
export const DescribeStacksHttp = Layer.effect(DescribeStacks, makeCloudFormationStackHttpBinding({
    tag: "AWS.CloudFormation.DescribeStacks",
    operation: cloudformation.describeStacks,
    actions: ["cloudformation:DescribeStacks"],
}));
//# sourceMappingURL=DescribeStacksHttp.js.map