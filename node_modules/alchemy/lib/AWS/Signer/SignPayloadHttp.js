import * as signer from "@distilled.cloud/aws/signer";
import * as Layer from "effect/Layer";
import { makeSignerProfileHttpBinding } from "./BindingHttp.js";
import { SignPayload } from "./SignPayload.js";
export const SignPayloadHttp = Layer.effect(SignPayload, makeSignerProfileHttpBinding({
    tag: "AWS.Signer.SignPayload",
    operation: signer.signPayload,
    actions: ["signer:SignPayload"],
}));
//# sourceMappingURL=SignPayloadHttp.js.map