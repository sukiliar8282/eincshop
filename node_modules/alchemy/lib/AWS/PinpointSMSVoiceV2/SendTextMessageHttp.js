import * as smsvoice from "@distilled.cloud/aws/pinpoint-sms-voice-v2";
import * as Layer from "effect/Layer";
import { makeSmsVoicePhoneNumberHttpBinding } from "./BindingHttp.js";
import { SendTextMessage } from "./SendTextMessage.js";
export const SendTextMessageHttp = Layer.effect(SendTextMessage, makeSmsVoicePhoneNumberHttpBinding({
    tag: "AWS.PinpointSMSVoiceV2.SendTextMessage",
    operation: smsvoice.sendTextMessage,
    actions: ["sms-voice:SendTextMessage"],
}));
//# sourceMappingURL=SendTextMessageHttp.js.map