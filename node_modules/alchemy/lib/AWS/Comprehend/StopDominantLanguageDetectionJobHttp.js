import * as comprehend from "@distilled.cloud/aws/comprehend";
import * as Layer from "effect/Layer";
import { makeComprehendHttpBinding } from "./BindingHttp.js";
import { StopDominantLanguageDetectionJob } from "./StopDominantLanguageDetectionJob.js";
export const StopDominantLanguageDetectionJobHttp = Layer.effect(StopDominantLanguageDetectionJob, makeComprehendHttpBinding({
    tag: "AWS.Comprehend.StopDominantLanguageDetectionJob",
    operation: comprehend.stopDominantLanguageDetectionJob,
    actions: ["comprehend:StopDominantLanguageDetectionJob"],
}));
//# sourceMappingURL=StopDominantLanguageDetectionJobHttp.js.map