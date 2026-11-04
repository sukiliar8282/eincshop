import * as kms from "@distilled.cloud/aws/kms";
import * as Layer from "effect/Layer";
import { makeKmsKeyHttpBinding } from "./BindingHttp.js";
import { GenerateDataKeyPairWithoutPlaintext } from "./GenerateDataKeyPairWithoutPlaintext.js";
export const GenerateDataKeyPairWithoutPlaintextHttp = Layer.effect(GenerateDataKeyPairWithoutPlaintext, makeKmsKeyHttpBinding({
    tag: "AWS.KMS.GenerateDataKeyPairWithoutPlaintext",
    operation: kms.generateDataKeyPairWithoutPlaintext,
    actions: ["kms:GenerateDataKeyPairWithoutPlaintext"],
}));
//# sourceMappingURL=GenerateDataKeyPairWithoutPlaintextHttp.js.map