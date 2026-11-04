import * as comprehend from "@distilled.cloud/aws/comprehend";
import * as Layer from "effect/Layer";
import { makeComprehendStartJobHttpBinding } from "./BindingHttp.js";
import { StartDominantLanguageDetectionJob } from "./StartDominantLanguageDetectionJob.js";
export const StartDominantLanguageDetectionJobHttp = Layer.effect(StartDominantLanguageDetectionJob, makeComprehendStartJobHttpBinding({
    tag: "AWS.Comprehend.StartDominantLanguageDetectionJob",
    operation: comprehend.startDominantLanguageDetectionJob,
    actions: ["comprehend:StartDominantLanguageDetectionJob"],
}));
//# sourceMappingURL=StartDominantLanguageDetectionJobHttp.js.map