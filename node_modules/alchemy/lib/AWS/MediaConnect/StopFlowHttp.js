import * as mediaconnect from "@distilled.cloud/aws/mediaconnect";
import * as Layer from "effect/Layer";
import { makeMediaConnectFlowHttpBinding } from "./BindingHttp.js";
import { StopFlow } from "./StopFlow.js";
export const StopFlowHttp = Layer.effect(StopFlow, makeMediaConnectFlowHttpBinding({
    tag: "AWS.MediaConnect.StopFlow",
    operation: mediaconnect.stopFlow,
    actions: ["mediaconnect:StopFlow"],
}));
//# sourceMappingURL=StopFlowHttp.js.map