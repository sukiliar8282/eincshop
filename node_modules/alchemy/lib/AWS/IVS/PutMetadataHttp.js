import * as ivs from "@distilled.cloud/aws/ivs";
import * as Layer from "effect/Layer";
import { makeIvsChannelHttpBinding } from "./BindingHttp.js";
import { PutMetadata } from "./PutMetadata.js";
export const PutMetadataHttp = Layer.effect(PutMetadata, makeIvsChannelHttpBinding({
    tag: "AWS.IVS.PutMetadata",
    operation: ivs.putMetadata,
    actions: ["ivs:PutMetadata"],
}));
//# sourceMappingURL=PutMetadataHttp.js.map