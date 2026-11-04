import * as cloudformation from "@distilled.cloud/aws/cloudformation";
import * as Layer from "effect/Layer";
import { makeCloudFormationStackHttpBinding } from "./BindingHttp.js";
import { DescribeStackResources } from "./DescribeStackResources.js";
export const DescribeStackResourcesHttp = Layer.effect(DescribeStackResources, makeCloudFormationStackHttpBinding({
    tag: "AWS.CloudFormation.DescribeStackResources",
    operation: cloudformation.describeStackResources,
    actions: ["cloudformation:DescribeStackResources"],
}));
//# sourceMappingURL=DescribeStackResourcesHttp.js.map