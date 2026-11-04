import * as ivsrealtime from "@distilled.cloud/aws/ivs-realtime";
import * as Layer from "effect/Layer";
import { makeIvsRealtimeStageHttpBinding } from "./BindingHttp.js";
import { ListParticipantReplicas } from "./ListParticipantReplicas.js";
export const ListParticipantReplicasHttp = Layer.effect(ListParticipantReplicas, makeIvsRealtimeStageHttpBinding({
    tag: "AWS.IVSRealtime.ListParticipantReplicas",
    operation: ivsrealtime.listParticipantReplicas,
    actions: ["ivs:ListParticipantReplicas"],
    requestKey: "sourceStageArn",
}));
//# sourceMappingURL=ListParticipantReplicasHttp.js.map