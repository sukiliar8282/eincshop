import * as ivsrealtime from "@distilled.cloud/aws/ivs-realtime";
import * as Layer from "effect/Layer";
import { makeIvsRealtimeStageHttpBinding } from "./BindingHttp.js";
import { ListParticipants } from "./ListParticipants.js";
export const ListParticipantsHttp = Layer.effect(ListParticipants, makeIvsRealtimeStageHttpBinding({
    tag: "AWS.IVSRealtime.ListParticipants",
    operation: ivsrealtime.listParticipants,
    actions: ["ivs:ListParticipants"],
}));
//# sourceMappingURL=ListParticipantsHttp.js.map