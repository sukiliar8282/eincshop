import * as sns from "@distilled.cloud/aws/sns";
import * as Layer from "effect/Layer";
import { makeSnsAccountHttpBinding } from "./BindingHttp.js";
import { GetSMSSandboxAccountStatus } from "./GetSMSSandboxAccountStatus.js";
export const GetSMSSandboxAccountStatusHttp = Layer.effect(GetSMSSandboxAccountStatus, makeSnsAccountHttpBinding({
    tag: "AWS.SNS.GetSMSSandboxAccountStatus",
    operation: sns.getSMSSandboxAccountStatus,
    actions: [
        "sns:GetSMSSandboxAccountStatus",
        "sms-voice:DescribeAccountAttributes",
    ],
}));
//# sourceMappingURL=GetSMSSandboxAccountStatusHttp.js.map