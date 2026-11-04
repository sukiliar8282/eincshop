import * as mediaconvert from "@distilled.cloud/aws/mediaconvert";
import * as Layer from "effect/Layer";
import { makeMediaConvertHttpBinding } from "./BindingHttp.js";
import { GetJobsQueryResults } from "./GetJobsQueryResults.js";
export const GetJobsQueryResultsHttp = Layer.effect(GetJobsQueryResults, makeMediaConvertHttpBinding({
    capability: "GetJobsQueryResults",
    iamActions: ["mediaconvert:GetJobsQueryResults"],
    operation: mediaconvert.getJobsQueryResults,
}));
//# sourceMappingURL=GetJobsQueryResultsHttp.js.map