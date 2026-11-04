import * as comprehend from "@distilled.cloud/aws/comprehend";
import * as Layer from "effect/Layer";
import { makeComprehendStartJobHttpBinding } from "./BindingHttp.js";
import { StartTopicsDetectionJob } from "./StartTopicsDetectionJob.js";
export const StartTopicsDetectionJobHttp = Layer.effect(StartTopicsDetectionJob, makeComprehendStartJobHttpBinding({
    tag: "AWS.Comprehend.StartTopicsDetectionJob",
    operation: comprehend.startTopicsDetectionJob,
    actions: ["comprehend:StartTopicsDetectionJob"],
}));
//# sourceMappingURL=StartTopicsDetectionJobHttp.js.map