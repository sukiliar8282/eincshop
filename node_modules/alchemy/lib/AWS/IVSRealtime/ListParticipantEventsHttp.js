import * as ivsrealtime from "@distilled.cloud/aws/ivs-realtime";
import * as Layer from "effect/Layer";
import { makeIvsRealtimeStageHttpBinding } from "./BindingHttp.js";
import { ListParticipantEvents } from "./ListParticipantEvents.js";
export const ListParticipantEventsHttp = Layer.effect(ListParticipantEvents, makeIvsRealtimeStageHttpBinding({
    tag: "AWS.IVSRealtime.ListParticipantEvents",
    operation: ivsrealtime.listParticipantEvents,
    actions: ["ivs:ListParticipantEvents"],
}));
//# sourceMappingURL=ListParticipantEventsHttp.js.map