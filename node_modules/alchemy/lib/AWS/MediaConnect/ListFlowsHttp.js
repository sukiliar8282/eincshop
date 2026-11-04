import * as mediaconnect from "@distilled.cloud/aws/mediaconnect";
import * as Layer from "effect/Layer";
import { makeMediaConnectAccountHttpBinding } from "./BindingHttp.js";
import { ListFlows } from "./ListFlows.js";
export const ListFlowsHttp = Layer.effect(ListFlows, makeMediaConnectAccountHttpBinding({
    tag: "AWS.MediaConnect.ListFlows",
    operation: mediaconnect.listFlows,
    actions: ["mediaconnect:ListFlows"],
}));
//# sourceMappingURL=ListFlowsHttp.js.map