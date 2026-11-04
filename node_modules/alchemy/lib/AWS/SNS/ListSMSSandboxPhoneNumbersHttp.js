import * as sns from "@distilled.cloud/aws/sns";
import * as Layer from "effect/Layer";
import { makeSnsAccountHttpBinding } from "./BindingHttp.js";
import { ListSMSSandboxPhoneNumbers } from "./ListSMSSandboxPhoneNumbers.js";
export const ListSMSSandboxPhoneNumbersHttp = Layer.effect(ListSMSSandboxPhoneNumbers, makeSnsAccountHttpBinding({
    tag: "AWS.SNS.ListSMSSandboxPhoneNumbers",
    operation: sns.listSMSSandboxPhoneNumbers,
    actions: [
        "sns:ListSMSSandboxPhoneNumbers",
        "sms-voice:DescribeVerifiedDestinationNumbers",
    ],
}));
//# sourceMappingURL=ListSMSSandboxPhoneNumbersHttp.js.map