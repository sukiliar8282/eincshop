import * as comprehend from "@distilled.cloud/aws/comprehend";
import * as Layer from "effect/Layer";
import { makeComprehendStartJobHttpBinding } from "./BindingHttp.js";
import { StartEventsDetectionJob } from "./StartEventsDetectionJob.js";
export const StartEventsDetectionJobHttp = Layer.effect(StartEventsDetectionJob, makeComprehendStartJobHttpBinding({
    tag: "AWS.Comprehend.StartEventsDetectionJob",
    operation: comprehend.startEventsDetectionJob,
    actions: ["comprehend:StartEventsDetectionJob"],
}));
//# sourceMappingURL=StartEventsDetectionJobHttp.js.map