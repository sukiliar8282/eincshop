import * as sns from "@distilled.cloud/aws/sns";
import * as Layer from "effect/Layer";
import { makeSnsTopicHttpBinding } from "./BindingHttp.js";
import { UntagResource } from "./UntagResource.js";
export const UntagResourceHttp = Layer.effect(UntagResource, makeSnsTopicHttpBinding({
    tag: "AWS.SNS.UntagResource",
    operation: sns.untagResource,
    actions: ["sns:UntagResource"],
    key: "ResourceArn",
}));
//# sourceMappingURL=UntagResourceHttp.js.map