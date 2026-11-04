import * as ivs from "@distilled.cloud/aws/ivs";
import * as Layer from "effect/Layer";
import { makeIvsAccountHttpBinding } from "./BindingHttp.js";
import { ListStreams } from "./ListStreams.js";
export const ListStreamsHttp = Layer.effect(ListStreams, makeIvsAccountHttpBinding({
    tag: "AWS.IVS.ListStreams",
    operation: ivs.listStreams,
    actions: ["ivs:ListStreams"],
}));
//# sourceMappingURL=ListStreamsHttp.js.map