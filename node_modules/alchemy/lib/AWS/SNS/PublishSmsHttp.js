import * as sns from "@distilled.cloud/aws/sns";
import * as Layer from "effect/Layer";
import { makeSnsAccountHttpBinding } from "./BindingHttp.js";
import { PublishSms } from "./PublishSms.js";
export const PublishSmsHttp = Layer.effect(PublishSms, makeSnsAccountHttpBinding({
    tag: "AWS.SNS.PublishSms",
    operation: sns.publish,
    // Direct SMS delivery is backed by `sms-voice:SendTextMessage`
    // (probe-verified).
    actions: ["sns:Publish", "sms-voice:SendTextMessage"],
}));
//# sourceMappingURL=PublishSmsHttp.js.map