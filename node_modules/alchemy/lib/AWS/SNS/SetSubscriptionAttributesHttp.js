import * as sns from "@distilled.cloud/aws/sns";
import * as Layer from "effect/Layer";
import { makeSnsSubscriptionHttpBinding } from "./BindingHttp.js";
import { SetSubscriptionAttributes } from "./SetSubscriptionAttributes.js";
export const SetSubscriptionAttributesHttp = Layer.effect(SetSubscriptionAttributes, makeSnsSubscriptionHttpBinding({
    tag: "AWS.SNS.SetSubscriptionAttributes",
    operation: sns.setSubscriptionAttributes,
    actions: ["sns:SetSubscriptionAttributes"],
    key: "SubscriptionArn",
}));
//# sourceMappingURL=SetSubscriptionAttributesHttp.js.map