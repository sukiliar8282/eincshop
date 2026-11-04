import * as kms from "@distilled.cloud/aws/kms";
import * as Layer from "effect/Layer";
import { makeKmsKeyHttpBinding } from "./BindingHttp.js";
import { GenerateDataKeyWithoutPlaintext } from "./GenerateDataKeyWithoutPlaintext.js";
export const GenerateDataKeyWithoutPlaintextHttp = Layer.effect(GenerateDataKeyWithoutPlaintext, makeKmsKeyHttpBinding({
    tag: "AWS.KMS.GenerateDataKeyWithoutPlaintext",
    operation: kms.generateDataKeyWithoutPlaintext,
    actions: ["kms:GenerateDataKeyWithoutPlaintext"],
}));
//# sourceMappingURL=GenerateDataKeyWithoutPlaintextHttp.js.map