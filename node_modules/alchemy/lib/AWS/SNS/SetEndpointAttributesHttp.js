import * as sns from "@distilled.cloud/aws/sns";
import * as Layer from "effect/Layer";
import { makeSnsEndpointHttpBinding } from "./BindingHttp.js";
import { SetEndpointAttributes } from "./SetEndpointAttributes.js";
export const SetEndpointAttributesHttp = Layer.effect(SetEndpointAttributes, makeSnsEndpointHttpBinding({
    tag: "AWS.SNS.SetEndpointAttributes",
    operation: sns.setEndpointAttributes,
    actions: ["sns:SetEndpointAttributes"],
}));
//# sourceMappingURL=SetEndpointAttributesHttp.js.map