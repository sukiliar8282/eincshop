import * as comprehend from "@distilled.cloud/aws/comprehend";
import * as Layer from "effect/Layer";
import { makeComprehendHttpBinding } from "./BindingHttp.js";
import { ListSentimentDetectionJobs } from "./ListSentimentDetectionJobs.js";
export const ListSentimentDetectionJobsHttp = Layer.effect(ListSentimentDetectionJobs, makeComprehendHttpBinding({
    tag: "AWS.Comprehend.ListSentimentDetectionJobs",
    operation: comprehend.listSentimentDetectionJobs,
    actions: ["comprehend:ListSentimentDetectionJobs"],
}));
//# sourceMappingURL=ListSentimentDetectionJobsHttp.js.map