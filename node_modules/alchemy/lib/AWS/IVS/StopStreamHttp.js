import * as ivs from "@distilled.cloud/aws/ivs";
import * as Layer from "effect/Layer";
import { makeIvsChannelHttpBinding } from "./BindingHttp.js";
import { StopStream } from "./StopStream.js";
export const StopStreamHttp = Layer.effect(StopStream, makeIvsChannelHttpBinding({
    tag: "AWS.IVS.StopStream",
    operation: ivs.stopStream,
    actions: ["ivs:StopStream"],
}));
//# sourceMappingURL=StopStreamHttp.js.map