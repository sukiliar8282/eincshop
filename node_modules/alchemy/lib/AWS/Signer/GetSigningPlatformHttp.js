import * as signer from "@distilled.cloud/aws/signer";
import * as Layer from "effect/Layer";
import { makeSignerHttpBinding } from "./BindingHttp.js";
import { GetSigningPlatform } from "./GetSigningPlatform.js";
export const GetSigningPlatformHttp = Layer.effect(GetSigningPlatform, makeSignerHttpBinding({
    tag: "AWS.Signer.GetSigningPlatform",
    operation: signer.getSigningPlatform,
    actions: ["signer:GetSigningPlatform"],
}));
//# sourceMappingURL=GetSigningPlatformHttp.js.map