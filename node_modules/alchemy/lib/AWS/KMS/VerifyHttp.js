import * as kms from "@distilled.cloud/aws/kms";
import * as Layer from "effect/Layer";
import { makeKmsKeyHttpBinding } from "./BindingHttp.js";
import { Verify } from "./Verify.js";
export const VerifyHttp = Layer.effect(Verify, makeKmsKeyHttpBinding({
    tag: "AWS.KMS.Verify",
    operation: kms.verify,
    actions: ["kms:Verify"],
}));
//# sourceMappingURL=VerifyHttp.js.map