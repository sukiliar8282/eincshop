import * as comprehend from "@distilled.cloud/aws/comprehend";
import * as Layer from "effect/Layer";
import { makeComprehendStartJobHttpBinding } from "./BindingHttp.js";
import { StartTargetedSentimentDetectionJob } from "./StartTargetedSentimentDetectionJob.js";
export const StartTargetedSentimentDetectionJobHttp = Layer.effect(StartTargetedSentimentDetectionJob, makeComprehendStartJobHttpBinding({
    tag: "AWS.Comprehend.StartTargetedSentimentDetectionJob",
    operation: comprehend.startTargetedSentimentDetectionJob,
    actions: ["comprehend:StartTargetedSentimentDetectionJob"],
}));
//# sourceMappingURL=StartTargetedSentimentDetectionJobHttp.js.map