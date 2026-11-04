import * as ivsrealtime from "@distilled.cloud/aws/ivs-realtime";
import * as Layer from "effect/Layer";
import { makeIvsRealtimeStageHttpBinding } from "./BindingHttp.js";
import { GetParticipant } from "./GetParticipant.js";
export const GetParticipantHttp = Layer.effect(GetParticipant, makeIvsRealtimeStageHttpBinding({
    tag: "AWS.IVSRealtime.GetParticipant",
    operation: ivsrealtime.getParticipant,
    actions: ["ivs:GetParticipant"],
}));
//# sourceMappingURL=GetParticipantHttp.js.map