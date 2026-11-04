import * as comprehend from "@distilled.cloud/aws/comprehend";
import * as Layer from "effect/Layer";
import { makeComprehendHttpBinding } from "./BindingHttp.js";
import { StopTargetedSentimentDetectionJob } from "./StopTargetedSentimentDetectionJob.js";
export const StopTargetedSentimentDetectionJobHttp = Layer.effect(StopTargetedSentimentDetectionJob, makeComprehendHttpBinding({
    tag: "AWS.Comprehend.StopTargetedSentimentDetectionJob",
    operation: comprehend.stopTargetedSentimentDetectionJob,
    actions: ["comprehend:StopTargetedSentimentDetectionJob"],
}));
//# sourceMappingURL=StopTargetedSentimentDetectionJobHttp.js.map