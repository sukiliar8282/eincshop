import * as kms from "@distilled.cloud/aws/kms";
import * as Layer from "effect/Layer";
import { makeKmsKeyHttpBinding } from "./BindingHttp.js";
import { GenerateDataKeyPair } from "./GenerateDataKeyPair.js";
export const GenerateDataKeyPairHttp = Layer.effect(GenerateDataKeyPair, makeKmsKeyHttpBinding({
    tag: "AWS.KMS.GenerateDataKeyPair",
    operation: kms.generateDataKeyPair,
    actions: ["kms:GenerateDataKeyPair"],
}));
//# sourceMappingURL=GenerateDataKeyPairHttp.js.map