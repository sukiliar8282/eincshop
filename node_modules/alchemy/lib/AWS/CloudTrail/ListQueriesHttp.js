import * as cloudtrail from "@distilled.cloud/aws/cloudtrail";
import * as Layer from "effect/Layer";
import { makeCloudTrailEventDataStoreHttpBinding } from "./BindingHttp.js";
import { ListQueries } from "./ListQueries.js";
export const ListQueriesHttp = Layer.effect(ListQueries, makeCloudTrailEventDataStoreHttpBinding({
    tag: "AWS.CloudTrail.ListQueries",
    operation: cloudtrail.listQueries,
    actions: ["cloudtrail:ListQueries"],
    injectEventDataStore: true,
}));
//# sourceMappingURL=ListQueriesHttp.js.map