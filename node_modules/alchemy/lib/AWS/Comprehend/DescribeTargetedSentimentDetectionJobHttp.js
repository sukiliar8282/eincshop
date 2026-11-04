import * as comprehend from "@distilled.cloud/aws/comprehend";
import * as Layer from "effect/Layer";
import { makeComprehendHttpBinding } from "./BindingHttp.js";
import { DescribeTargetedSentimentDetectionJob } from "./DescribeTargetedSentimentDetectionJob.js";
export const DescribeTargetedSentimentDetectionJobHttp = Layer.effect(DescribeTargetedSentimentDetectionJob, makeComprehendHttpBinding({
    tag: "AWS.Comprehend.DescribeTargetedSentimentDetectionJob",
    operation: comprehend.describeTargetedSentimentDetectionJob,
    actions: ["comprehend:DescribeTargetedSentimentDetectionJob"],
}));
//# sourceMappingURL=DescribeTargetedSentimentDetectionJobHttp.js.map