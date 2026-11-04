import * as ivs from "@distilled.cloud/aws/ivs";
import * as Layer from "effect/Layer";
import { makeIvsChannelHttpBinding } from "./BindingHttp.js";
import { ListStreamSessions } from "./ListStreamSessions.js";
export const ListStreamSessionsHttp = Layer.effect(ListStreamSessions, makeIvsChannelHttpBinding({
    tag: "AWS.IVS.ListStreamSessions",
    operation: ivs.listStreamSessions,
    actions: ["ivs:ListStreamSessions"],
}));
//# sourceMappingURL=ListStreamSessionsHttp.js.map