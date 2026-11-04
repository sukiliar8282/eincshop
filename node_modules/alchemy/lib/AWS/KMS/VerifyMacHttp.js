import * as kms from "@distilled.cloud/aws/kms";
import * as Layer from "effect/Layer";
import { makeKmsKeyHttpBinding } from "./BindingHttp.js";
import { VerifyMac } from "./VerifyMac.js";
export const VerifyMacHttp = Layer.effect(VerifyMac, makeKmsKeyHttpBinding({
    tag: "AWS.KMS.VerifyMac",
    operation: kms.verifyMac,
    actions: ["kms:VerifyMac"],
}));
//# sourceMappingURL=VerifyMacHttp.js.map