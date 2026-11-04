import * as smsvoice from "@distilled.cloud/aws/pinpoint-sms-voice-v2";
import * as Layer from "effect/Layer";
import { makeSmsVoiceAccountHttpBinding } from "./BindingHttp.js";
import { PutMessageFeedback } from "./PutMessageFeedback.js";
export const PutMessageFeedbackHttp = Layer.effect(PutMessageFeedback, makeSmsVoiceAccountHttpBinding({
    tag: "AWS.PinpointSMSVoiceV2.PutMessageFeedback",
    operation: smsvoice.putMessageFeedback,
    actions: ["sms-voice:PutMessageFeedback"],
}));
//# sourceMappingURL=PutMessageFeedbackHttp.js.map