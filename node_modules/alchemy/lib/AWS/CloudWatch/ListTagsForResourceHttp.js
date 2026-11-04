import * as cloudwatch from "@distilled.cloud/aws/cloudwatch";
import * as Layer from "effect/Layer";
import { getTaggableResourceArn, } from "./binding-common.js";
import { makeCloudWatchResourceHttpBinding } from "./BindingHttp.js";
import { ListTagsForResource } from "./ListTagsForResource.js";
export const ListTagsForResourceHttp = Layer.effect(ListTagsForResource, makeCloudWatchResourceHttpBinding({
    tag: "AWS.CloudWatch.ListTagsForResource",
    operation: cloudwatch.listTagsForResource,
    actions: ["cloudwatch:ListTagsForResource"],
    requestKey: "ResourceARN",
    identifier: (resource) => getTaggableResourceArn(resource),
    resourceArn: (resource) => getTaggableResourceArn(resource),
}));
//# sourceMappingURL=ListTagsForResourceHttp.js.map