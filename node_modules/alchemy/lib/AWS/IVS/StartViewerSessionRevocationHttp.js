import * as ivs from "@distilled.cloud/aws/ivs";
import * as Layer from "effect/Layer";
import { makeIvsChannelHttpBinding } from "./BindingHttp.js";
import { StartViewerSessionRevocation } from "./StartViewerSessionRevocation.js";
export const StartViewerSessionRevocationHttp = Layer.effect(StartViewerSessionRevocation, makeIvsChannelHttpBinding({
    tag: "AWS.IVS.StartViewerSessionRevocation",
    operation: ivs.startViewerSessionRevocation,
    actions: ["ivs:StartViewerSessionRevocation"],
}));
//# sourceMappingURL=StartViewerSessionRevocationHttp.js.map