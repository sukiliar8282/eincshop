import * as comprehend from "@distilled.cloud/aws/comprehend";
import * as Layer from "effect/Layer";
import { makeComprehendHttpBinding } from "./BindingHttp.js";
import { ListEntitiesDetectionJobs } from "./ListEntitiesDetectionJobs.js";
export const ListEntitiesDetectionJobsHttp = Layer.effect(ListEntitiesDetectionJobs, makeComprehendHttpBinding({
    tag: "AWS.Comprehend.ListEntitiesDetectionJobs",
    operation: comprehend.listEntitiesDetectionJobs,
    actions: ["comprehend:ListEntitiesDetectionJobs"],
}));
//# sourceMappingURL=ListEntitiesDetectionJobsHttp.js.map