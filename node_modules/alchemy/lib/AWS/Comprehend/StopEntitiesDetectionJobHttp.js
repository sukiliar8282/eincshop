import * as comprehend from "@distilled.cloud/aws/comprehend";
import * as Layer from "effect/Layer";
import { makeComprehendHttpBinding } from "./BindingHttp.js";
import { StopEntitiesDetectionJob } from "./StopEntitiesDetectionJob.js";
export const StopEntitiesDetectionJobHttp = Layer.effect(StopEntitiesDetectionJob, makeComprehendHttpBinding({
    tag: "AWS.Comprehend.StopEntitiesDetectionJob",
    operation: comprehend.stopEntitiesDetectionJob,
    actions: ["comprehend:StopEntitiesDetectionJob"],
}));
//# sourceMappingURL=StopEntitiesDetectionJobHttp.js.map