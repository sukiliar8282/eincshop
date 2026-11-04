import * as ssm from "@distilled.cloud/aws/ssm-contacts";
import * as Layer from "effect/Layer";
import { makeContactChannelHttpBinding } from "./BindingHttp.js";
import { SendActivationCode } from "./SendActivationCode.js";
export const SendActivationCodeHttp = Layer.effect(SendActivationCode, makeContactChannelHttpBinding({
    tag: "AWS.SSMContacts.SendActivationCode",
    operation: ssm.sendActivationCode,
    actions: ["ssm-contacts:SendActivationCode"],
}));
//# sourceMappingURL=SendActivationCodeHttp.js.map