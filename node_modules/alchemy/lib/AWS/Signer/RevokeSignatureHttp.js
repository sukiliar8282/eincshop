import * as signer from "@distilled.cloud/aws/signer";
import * as Layer from "effect/Layer";
import { makeSignerHttpBinding } from "./BindingHttp.js";
import { RevokeSignature } from "./RevokeSignature.js";
export const RevokeSignatureHttp = Layer.effect(RevokeSignature, makeSignerHttpBinding({
    tag: "AWS.Signer.RevokeSignature",
    operation: signer.revokeSignature,
    actions: ["signer:RevokeSignature"],
}));
//# sourceMappingURL=RevokeSignatureHttp.js.map