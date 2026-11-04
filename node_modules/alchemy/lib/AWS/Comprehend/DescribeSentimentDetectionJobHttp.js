import * as comprehend from "@distilled.cloud/aws/comprehend";
import * as Layer from "effect/Layer";
import { makeComprehendHttpBinding } from "./BindingHttp.js";
import { DescribeSentimentDetectionJob } from "./DescribeSentimentDetectionJob.js";
export const DescribeSentimentDetectionJobHttp = Layer.effect(DescribeSentimentDetectionJob, makeComprehendHttpBinding({
    tag: "AWS.Comprehend.DescribeSentimentDetectionJob",
    operation: comprehend.describeSentimentDetectionJob,
    actions: ["comprehend:DescribeSentimentDetectionJob"],
}));
//# sourceMappingURL=DescribeSentimentDetectionJobHttp.js.map