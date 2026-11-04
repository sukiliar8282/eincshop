import * as ivsrealtime from "@distilled.cloud/aws/ivs-realtime";
import * as Layer from "effect/Layer";
import { makeIvsRealtimeStageHttpBinding } from "./BindingHttp.js";
import { GetStageSession } from "./GetStageSession.js";
export const GetStageSessionHttp = Layer.effect(GetStageSession, makeIvsRealtimeStageHttpBinding({
    tag: "AWS.IVSRealtime.GetStageSession",
    operation: ivsrealtime.getStageSession,
    actions: ["ivs:GetStageSession"],
}));
//# sourceMappingURL=GetStageSessionHttp.js.map