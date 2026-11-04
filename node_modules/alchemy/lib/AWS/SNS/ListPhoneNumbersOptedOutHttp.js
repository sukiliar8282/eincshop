import * as sns from "@distilled.cloud/aws/sns";
import * as Layer from "effect/Layer";
import { makeSnsAccountHttpBinding } from "./BindingHttp.js";
import { ListPhoneNumbersOptedOut } from "./ListPhoneNumbersOptedOut.js";
export const ListPhoneNumbersOptedOutHttp = Layer.effect(ListPhoneNumbersOptedOut, makeSnsAccountHttpBinding({
    tag: "AWS.SNS.ListPhoneNumbersOptedOut",
    operation: sns.listPhoneNumbersOptedOut,
    actions: [
        "sns:ListPhoneNumbersOptedOut",
        "sms-voice:DescribeOptedOutNumbers",
    ],
}));
//# sourceMappingURL=ListPhoneNumbersOptedOutHttp.js.map