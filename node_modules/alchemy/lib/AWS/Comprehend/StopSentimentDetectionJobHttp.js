import * as comprehend from "@distilled.cloud/aws/comprehend";
import * as Layer from "effect/Layer";
import { makeComprehendHttpBinding } from "./BindingHttp.js";
import { StopSentimentDetectionJob } from "./StopSentimentDetectionJob.js";
export const StopSentimentDetectionJobHttp = Layer.effect(StopSentimentDetectionJob, makeComprehendHttpBinding({
    tag: "AWS.Comprehend.StopSentimentDetectionJob",
    operation: comprehend.stopSentimentDetectionJob,
    actions: ["comprehend:StopSentimentDetectionJob"],
}));
//# sourceMappingURL=StopSentimentDetectionJobHttp.js.map