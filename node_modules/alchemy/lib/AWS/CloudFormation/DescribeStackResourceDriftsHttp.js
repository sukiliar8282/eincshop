import * as cloudformation from "@distilled.cloud/aws/cloudformation";
import * as Layer from "effect/Layer";
import { makeCloudFormationStackHttpBinding } from "./BindingHttp.js";
import { DescribeStackResourceDrifts } from "./DescribeStackResourceDrifts.js";
export const DescribeStackResourceDriftsHttp = Layer.effect(DescribeStackResourceDrifts, makeCloudFormationStackHttpBinding({
    tag: "AWS.CloudFormation.DescribeStackResourceDrifts",
    operation: cloudformation.describeStackResourceDrifts,
    actions: ["cloudformation:DescribeStackResourceDrifts"],
}));
//# sourceMappingURL=DescribeStackResourceDriftsHttp.js.map