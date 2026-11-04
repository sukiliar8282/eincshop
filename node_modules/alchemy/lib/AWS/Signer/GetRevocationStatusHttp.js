import * as signer from "@distilled.cloud/aws/signer";
import * as Layer from "effect/Layer";
import { makeSignerHttpBinding } from "./BindingHttp.js";
import { GetRevocationStatus } from "./GetRevocationStatus.js";
export const GetRevocationStatusHttp = Layer.effect(GetRevocationStatus, makeSignerHttpBinding({
    tag: "AWS.Signer.GetRevocationStatus",
    operation: signer.getRevocationStatus,
    actions: ["signer:GetRevocationStatus"],
}));
//# sourceMappingURL=GetRevocationStatusHttp.js.map