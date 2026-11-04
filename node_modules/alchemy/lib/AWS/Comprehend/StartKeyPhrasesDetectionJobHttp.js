import * as comprehend from "@distilled.cloud/aws/comprehend";
import * as Layer from "effect/Layer";
import { makeComprehendStartJobHttpBinding } from "./BindingHttp.js";
import { StartKeyPhrasesDetectionJob } from "./StartKeyPhrasesDetectionJob.js";
export const StartKeyPhrasesDetectionJobHttp = Layer.effect(StartKeyPhrasesDetectionJob, makeComprehendStartJobHttpBinding({
    tag: "AWS.Comprehend.StartKeyPhrasesDetectionJob",
    operation: comprehend.startKeyPhrasesDetectionJob,
    actions: ["comprehend:StartKeyPhrasesDetectionJob"],
}));
//# sourceMappingURL=StartKeyPhrasesDetectionJobHttp.js.map