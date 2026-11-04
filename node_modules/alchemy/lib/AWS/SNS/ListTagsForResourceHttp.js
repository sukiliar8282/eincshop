import * as sns from "@distilled.cloud/aws/sns";
import * as Layer from "effect/Layer";
import { makeSnsTopicHttpBinding } from "./BindingHttp.js";
import { ListTagsForResource } from "./ListTagsForResource.js";
export const ListTagsForResourceHttp = Layer.effect(ListTagsForResource, makeSnsTopicHttpBinding({
    tag: "AWS.SNS.ListTagsForResource",
    operation: sns.listTagsForResource,
    actions: ["sns:ListTagsForResource"],
    key: "ResourceArn",
}));
//# sourceMappingURL=ListTagsForResourceHttp.js.map