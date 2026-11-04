import * as comprehend from "@distilled.cloud/aws/comprehend";
import * as Layer from "effect/Layer";
import { makeComprehendHttpBinding } from "./BindingHttp.js";
import { StopEventsDetectionJob } from "./StopEventsDetectionJob.js";
export const StopEventsDetectionJobHttp = Layer.effect(StopEventsDetectionJob, makeComprehendHttpBinding({
    tag: "AWS.Comprehend.StopEventsDetectionJob",
    operation: comprehend.stopEventsDetectionJob,
    actions: ["comprehend:StopEventsDetectionJob"],
}));
//# sourceMappingURL=StopEventsDetectionJobHttp.js.map