import * as sns from "@distilled.cloud/aws/sns";
import * as Layer from "effect/Layer";
import { makeSnsEndpointHttpBinding } from "./BindingHttp.js";
import { GetEndpointAttributes } from "./GetEndpointAttributes.js";
export const GetEndpointAttributesHttp = Layer.effect(GetEndpointAttributes, makeSnsEndpointHttpBinding({
    tag: "AWS.SNS.GetEndpointAttributes",
    operation: sns.getEndpointAttributes,
    actions: ["sns:GetEndpointAttributes"],
}));
//# sourceMappingURL=GetEndpointAttributesHttp.js.map