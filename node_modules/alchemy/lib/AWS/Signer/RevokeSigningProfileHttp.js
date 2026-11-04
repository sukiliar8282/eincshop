import * as signer from "@distilled.cloud/aws/signer";
import * as Layer from "effect/Layer";
import { makeSignerProfileHttpBinding } from "./BindingHttp.js";
import { RevokeSigningProfile } from "./RevokeSigningProfile.js";
export const RevokeSigningProfileHttp = Layer.effect(RevokeSigningProfile, makeSignerProfileHttpBinding({
    tag: "AWS.Signer.RevokeSigningProfile",
    operation: signer.revokeSigningProfile,
    actions: ["signer:RevokeSigningProfile"],
}));
//# sourceMappingURL=RevokeSigningProfileHttp.js.map