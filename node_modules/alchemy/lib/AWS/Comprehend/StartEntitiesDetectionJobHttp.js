import * as comprehend from "@distilled.cloud/aws/comprehend";
import * as Layer from "effect/Layer";
import { makeComprehendStartJobHttpBinding } from "./BindingHttp.js";
import { StartEntitiesDetectionJob } from "./StartEntitiesDetectionJob.js";
export const StartEntitiesDetectionJobHttp = Layer.effect(StartEntitiesDetectionJob, makeComprehendStartJobHttpBinding({
    tag: "AWS.Comprehend.StartEntitiesDetectionJob",
    operation: comprehend.startEntitiesDetectionJob,
    actions: ["comprehend:StartEntitiesDetectionJob"],
}));
//# sourceMappingURL=StartEntitiesDetectionJobHttp.js.map