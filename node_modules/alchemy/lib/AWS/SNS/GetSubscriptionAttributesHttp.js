import * as sns from "@distilled.cloud/aws/sns";
import * as Layer from "effect/Layer";
import { makeSnsSubscriptionHttpBinding } from "./BindingHttp.js";
import { GetSubscriptionAttributes } from "./GetSubscriptionAttributes.js";
export const GetSubscriptionAttributesHttp = Layer.effect(GetSubscriptionAttributes, makeSnsSubscriptionHttpBinding({
    tag: "AWS.SNS.GetSubscriptionAttributes",
    operation: sns.getSubscriptionAttributes,
    actions: ["sns:GetSubscriptionAttributes"],
    key: "SubscriptionArn",
}));
//# sourceMappingURL=GetSubscriptionAttributesHttp.js.map