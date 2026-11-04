import * as mediaconvert from "@distilled.cloud/aws/mediaconvert";
import * as Layer from "effect/Layer";
import { makeMediaConvertHttpBinding } from "./BindingHttp.js";
import { StartJobsQuery } from "./StartJobsQuery.js";
export const StartJobsQueryHttp = Layer.effect(StartJobsQuery, makeMediaConvertHttpBinding({
    capability: "StartJobsQuery",
    // The wire operation is StartJobsQuery but IAM authorizes the creation of
    // the query object as CreateJobsQuery — grant both spellings.
    iamActions: ["mediaconvert:StartJobsQuery", "mediaconvert:CreateJobsQuery"],
    operation: mediaconvert.startJobsQuery,
}));
//# sourceMappingURL=StartJobsQueryHttp.js.map