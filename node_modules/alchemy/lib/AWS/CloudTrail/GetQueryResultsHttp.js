import * as cloudtrail from "@distilled.cloud/aws/cloudtrail";
import * as Layer from "effect/Layer";
import { makeCloudTrailEventDataStoreHttpBinding } from "./BindingHttp.js";
import { GetQueryResults } from "./GetQueryResults.js";
export const GetQueryResultsHttp = Layer.effect(GetQueryResults, makeCloudTrailEventDataStoreHttpBinding({
    tag: "AWS.CloudTrail.GetQueryResults",
    operation: cloudtrail.getQueryResults,
    actions: ["cloudtrail:GetQueryResults"],
}));
//# sourceMappingURL=GetQueryResultsHttp.js.map