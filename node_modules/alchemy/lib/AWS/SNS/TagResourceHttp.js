import * as sns from "@distilled.cloud/aws/sns";
import * as Layer from "effect/Layer";
import { makeSnsTopicHttpBinding } from "./BindingHttp.js";
import { TagResource } from "./TagResource.js";
export const TagResourceHttp = Layer.effect(TagResource, makeSnsTopicHttpBinding({
    tag: "AWS.SNS.TagResource",
    operation: sns.tagResource,
    actions: ["sns:TagResource"],
    key: "ResourceArn",
}));
//# sourceMappingURL=TagResourceHttp.js.map