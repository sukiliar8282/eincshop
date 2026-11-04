import * as comprehend from "@distilled.cloud/aws/comprehend";
import * as Layer from "effect/Layer";
import { makeComprehendStartJobHttpBinding } from "./BindingHttp.js";
import { StartSentimentDetectionJob } from "./StartSentimentDetectionJob.js";
export const StartSentimentDetectionJobHttp = Layer.effect(StartSentimentDetectionJob, makeComprehendStartJobHttpBinding({
    tag: "AWS.Comprehend.StartSentimentDetectionJob",
    operation: comprehend.startSentimentDetectionJob,
    actions: ["comprehend:StartSentimentDetectionJob"],
}));
//# sourceMappingURL=StartSentimentDetectionJobHttp.js.map