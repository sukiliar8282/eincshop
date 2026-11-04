import * as ivsrealtime from "@distilled.cloud/aws/ivs-realtime";
import * as Layer from "effect/Layer";
import { makeIvsRealtimeStageHttpBinding } from "./BindingHttp.js";
import { ListStageSessions } from "./ListStageSessions.js";
export const ListStageSessionsHttp = Layer.effect(ListStageSessions, makeIvsRealtimeStageHttpBinding({
    tag: "AWS.IVSRealtime.ListStageSessions",
    operation: ivsrealtime.listStageSessions,
    actions: ["ivs:ListStageSessions"],
}));
//# sourceMappingURL=ListStageSessionsHttp.js.map