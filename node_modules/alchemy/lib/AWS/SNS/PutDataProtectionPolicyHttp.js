import * as sns from "@distilled.cloud/aws/sns";
import * as Layer from "effect/Layer";
import { makeSnsTopicHttpBinding } from "./BindingHttp.js";
import { PutDataProtectionPolicy } from "./PutDataProtectionPolicy.js";
export const PutDataProtectionPolicyHttp = Layer.effect(PutDataProtectionPolicy, makeSnsTopicHttpBinding({
    tag: "AWS.SNS.PutDataProtectionPolicy",
    operation: sns.putDataProtectionPolicy,
    actions: ["sns:PutDataProtectionPolicy"],
    key: "ResourceArn",
}));
//# sourceMappingURL=PutDataProtectionPolicyHttp.js.map