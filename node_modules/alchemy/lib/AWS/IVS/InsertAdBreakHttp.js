import * as ivs from "@distilled.cloud/aws/ivs";
import * as Layer from "effect/Layer";
import { makeIvsChannelHttpBinding } from "./BindingHttp.js";
import { InsertAdBreak } from "./InsertAdBreak.js";
export const InsertAdBreakHttp = Layer.effect(InsertAdBreak, makeIvsChannelHttpBinding({
    tag: "AWS.IVS.InsertAdBreak",
    operation: ivs.insertAdBreak,
    actions: ["ivs:InsertAdBreak"],
}));
//# sourceMappingURL=InsertAdBreakHttp.js.map