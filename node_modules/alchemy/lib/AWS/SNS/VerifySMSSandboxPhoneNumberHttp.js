import * as sns from "@distilled.cloud/aws/sns";
import * as Layer from "effect/Layer";
import { makeSnsAccountHttpBinding } from "./BindingHttp.js";
import { VerifySMSSandboxPhoneNumber } from "./VerifySMSSandboxPhoneNumber.js";
export const VerifySMSSandboxPhoneNumberHttp = Layer.effect(VerifySMSSandboxPhoneNumber, makeSnsAccountHttpBinding({
    tag: "AWS.SNS.VerifySMSSandboxPhoneNumber",
    operation: sns.verifySMSSandboxPhoneNumber,
    actions: [
        "sns:VerifySMSSandboxPhoneNumber",
        "sms-voice:VerifyDestinationNumber",
    ],
}));
//# sourceMappingURL=VerifySMSSandboxPhoneNumberHttp.js.map