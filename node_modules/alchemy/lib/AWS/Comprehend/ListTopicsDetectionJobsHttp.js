import * as comprehend from "@distilled.cloud/aws/comprehend";
import * as Layer from "effect/Layer";
import { makeComprehendHttpBinding } from "./BindingHttp.js";
import { ListTopicsDetectionJobs } from "./ListTopicsDetectionJobs.js";
export const ListTopicsDetectionJobsHttp = Layer.effect(ListTopicsDetectionJobs, makeComprehendHttpBinding({
    tag: "AWS.Comprehend.ListTopicsDetectionJobs",
    operation: comprehend.listTopicsDetectionJobs,
    actions: ["comprehend:ListTopicsDetectionJobs"],
}));
//# sourceMappingURL=ListTopicsDetectionJobsHttp.js.map