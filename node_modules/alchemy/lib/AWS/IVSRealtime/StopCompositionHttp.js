import * as ivsrealtime from "@distilled.cloud/aws/ivs-realtime";
import * as Layer from "effect/Layer";
import { COMPOSITION_ARN_WILDCARD, makeIvsRealtimeAccountHttpBinding, } from "./BindingHttp.js";
import { StopComposition } from "./StopComposition.js";
export const StopCompositionHttp = Layer.effect(StopComposition, makeIvsRealtimeAccountHttpBinding({
    tag: "AWS.IVSRealtime.StopComposition",
    operation: ivsrealtime.stopComposition,
    actions: ["ivs:StopComposition"],
    resources: [COMPOSITION_ARN_WILDCARD],
}));
//# sourceMappingURL=StopCompositionHttp.js.map