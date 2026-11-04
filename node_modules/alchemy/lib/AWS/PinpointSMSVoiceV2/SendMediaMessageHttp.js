import * as smsvoice from "@distilled.cloud/aws/pinpoint-sms-voice-v2";
import * as Layer from "effect/Layer";
import { makeSmsVoicePhoneNumberHttpBinding } from "./BindingHttp.js";
import { SendMediaMessage } from "./SendMediaMessage.js";
export const SendMediaMessageHttp = Layer.effect(SendMediaMessage, makeSmsVoicePhoneNumberHttpBinding({
    tag: "AWS.PinpointSMSVoiceV2.SendMediaMessage",
    operation: smsvoice.sendMediaMessage,
    actions: ["sms-voice:SendMediaMessage"],
}));
//# sourceMappingURL=SendMediaMessageHttp.js.map