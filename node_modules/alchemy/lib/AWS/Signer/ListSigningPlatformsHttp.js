import * as signer from "@distilled.cloud/aws/signer";
import * as Layer from "effect/Layer";
import { makeSignerHttpBinding } from "./BindingHttp.js";
import { ListSigningPlatforms } from "./ListSigningPlatforms.js";
export const ListSigningPlatformsHttp = Layer.effect(ListSigningPlatforms, makeSignerHttpBinding({
    tag: "AWS.Signer.ListSigningPlatforms",
    operation: signer.listSigningPlatforms,
    actions: ["signer:ListSigningPlatforms"],
}));
//# sourceMappingURL=ListSigningPlatformsHttp.js.map