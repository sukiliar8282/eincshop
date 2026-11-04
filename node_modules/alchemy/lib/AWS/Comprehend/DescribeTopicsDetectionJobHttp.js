import * as comprehend from "@distilled.cloud/aws/comprehend";
import * as Layer from "effect/Layer";
import { makeComprehendHttpBinding } from "./BindingHttp.js";
import { DescribeTopicsDetectionJob } from "./DescribeTopicsDetectionJob.js";
export const DescribeTopicsDetectionJobHttp = Layer.effect(DescribeTopicsDetectionJob, makeComprehendHttpBinding({
    tag: "AWS.Comprehend.DescribeTopicsDetectionJob",
    operation: comprehend.describeTopicsDetectionJob,
    actions: ["comprehend:DescribeTopicsDetectionJob"],
}));
//# sourceMappingURL=DescribeTopicsDetectionJobHttp.js.map