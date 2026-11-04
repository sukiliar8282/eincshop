import * as smsvoice from "@distilled.cloud/aws/pinpoint-sms-voice-v2";
import * as Layer from "effect/Layer";
import { makeSmsVoiceOptOutListHttpBinding } from "./BindingHttp.js";
import { PutOptedOutNumber } from "./PutOptedOutNumber.js";
export const PutOptedOutNumberHttp = Layer.effect(PutOptedOutNumber, makeSmsVoiceOptOutListHttpBinding({
    tag: "AWS.PinpointSMSVoiceV2.PutOptedOutNumber",
    operation: smsvoice.putOptedOutNumber,
    actions: ["sms-voice:PutOptedOutNumber"],
}));
//# sourceMappingURL=PutOptedOutNumberHttp.js.map