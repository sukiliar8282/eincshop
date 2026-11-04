import * as sns from "@distilled.cloud/aws/sns";
import * as Layer from "effect/Layer";
import { makeSnsTopicHttpBinding } from "./BindingHttp.js";
import { SetTopicAttributes } from "./SetTopicAttributes.js";
export const SetTopicAttributesHttp = Layer.effect(SetTopicAttributes, makeSnsTopicHttpBinding({
    tag: "AWS.SNS.SetTopicAttributes",
    operation: sns.setTopicAttributes,
    actions: ["sns:SetTopicAttributes"],
    key: "TopicArn",
}));
//# sourceMappingURL=SetTopicAttributesHttp.js.map