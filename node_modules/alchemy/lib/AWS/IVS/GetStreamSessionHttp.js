import * as ivs from "@distilled.cloud/aws/ivs";
import * as Layer from "effect/Layer";
import { makeIvsChannelHttpBinding } from "./BindingHttp.js";
import { GetStreamSession } from "./GetStreamSession.js";
export const GetStreamSessionHttp = Layer.effect(GetStreamSession, makeIvsChannelHttpBinding({
    tag: "AWS.IVS.GetStreamSession",
    operation: ivs.getStreamSession,
    actions: ["ivs:GetStreamSession"],
}));
//# sourceMappingURL=GetStreamSessionHttp.js.map