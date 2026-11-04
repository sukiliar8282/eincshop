import * as comprehend from "@distilled.cloud/aws/comprehend";
import * as Layer from "effect/Layer";
import { makeComprehendHttpBinding } from "./BindingHttp.js";
import { ListEventsDetectionJobs } from "./ListEventsDetectionJobs.js";
export const ListEventsDetectionJobsHttp = Layer.effect(ListEventsDetectionJobs, makeComprehendHttpBinding({
    tag: "AWS.Comprehend.ListEventsDetectionJobs",
    operation: comprehend.listEventsDetectionJobs,
    actions: ["comprehend:ListEventsDetectionJobs"],
}));
//# sourceMappingURL=ListEventsDetectionJobsHttp.js.map