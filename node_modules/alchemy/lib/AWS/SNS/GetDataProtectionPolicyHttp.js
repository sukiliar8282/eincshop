import * as sns from "@distilled.cloud/aws/sns";
import * as Layer from "effect/Layer";
import { makeSnsTopicHttpBinding } from "./BindingHttp.js";
import { GetDataProtectionPolicy } from "./GetDataProtectionPolicy.js";
export const GetDataProtectionPolicyHttp = Layer.effect(GetDataProtectionPolicy, makeSnsTopicHttpBinding({
    tag: "AWS.SNS.GetDataProtectionPolicy",
    operation: sns.getDataProtectionPolicy,
    actions: ["sns:GetDataProtectionPolicy"],
    key: "ResourceArn",
}));
//# sourceMappingURL=GetDataProtectionPolicyHttp.js.map