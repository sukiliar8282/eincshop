import * as cloudformation from "@distilled.cloud/aws/cloudformation";
import * as Layer from "effect/Layer";
import { makeCloudFormationAccountHttpBinding } from "./BindingHttp.js";
import { DescribeStackDriftDetectionStatus } from "./DescribeStackDriftDetectionStatus.js";
export const DescribeStackDriftDetectionStatusHttp = Layer.effect(DescribeStackDriftDetectionStatus, makeCloudFormationAccountHttpBinding({
    tag: "AWS.CloudFormation.DescribeStackDriftDetectionStatus",
    operation: cloudformation.describeStackDriftDetectionStatus,
    actions: ["cloudformation:DescribeStackDriftDetectionStatus"],
}));
//# sourceMappingURL=DescribeStackDriftDetectionStatusHttp.js.map