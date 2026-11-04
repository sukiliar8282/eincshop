import * as cloudtrail from "@distilled.cloud/aws/cloudtrail";
import * as Layer from "effect/Layer";
import { makeCloudTrailEventDataStoreHttpBinding } from "./BindingHttp.js";
import { DescribeQuery } from "./DescribeQuery.js";
export const DescribeQueryHttp = Layer.effect(DescribeQuery, makeCloudTrailEventDataStoreHttpBinding({
    tag: "AWS.CloudTrail.DescribeQuery",
    operation: cloudtrail.describeQuery,
    actions: ["cloudtrail:DescribeQuery"],
}));
//# sourceMappingURL=DescribeQueryHttp.js.map