import * as smsvoice from "@distilled.cloud/aws/pinpoint-sms-voice-v2";
import * as Layer from "effect/Layer";
import { makeSmsVoicePhoneNumberHttpBinding } from "./BindingHttp.js";
import { SendVoiceMessage } from "./SendVoiceMessage.js";
export const SendVoiceMessageHttp = Layer.effect(SendVoiceMessage, makeSmsVoicePhoneNumberHttpBinding({
    tag: "AWS.PinpointSMSVoiceV2.SendVoiceMessage",
    operation: smsvoice.sendVoiceMessage,
    actions: ["sms-voice:SendVoiceMessage"],
}));
//# sourceMappingURL=SendVoiceMessageHttp.js.map