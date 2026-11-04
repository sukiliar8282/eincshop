import * as ivsrealtime from "@distilled.cloud/aws/ivs-realtime";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { toWireSeconds } from "../../Util/Duration.js";
import { makeIvsRealtimeReplicationHttpBinding } from "./BindingHttp.js";
import { StartParticipantReplication, } from "./StartParticipantReplication.js";
export const StartParticipantReplicationHttp = Layer.effect(StartParticipantReplication, Effect.gen(function* () {
    const make = yield* makeIvsRealtimeReplicationHttpBinding({
        tag: "AWS.IVSRealtime.StartParticipantReplication",
        operation: ivsrealtime.startParticipantReplication,
        actions: ["ivs:StartParticipantReplication"],
    });
    return Effect.fn(function* (sourceStage, destinationStage) {
        const startReplication = yield* make(sourceStage, destinationStage);
        return ({ reconnectWindow, ...request }) => startReplication({
            ...request,
            reconnectWindowSeconds: toWireSeconds(reconnectWindow),
        });
    });
}));
//# sourceMappingURL=StartParticipantReplicationHttp.js.map