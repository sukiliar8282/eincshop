import * as kms from "@distilled.cloud/aws/kms";
import * as Layer from "effect/Layer";
import { makeKmsAccountHttpBinding } from "./BindingHttp.js";
import { GenerateRandom } from "./GenerateRandom.js";
export const GenerateRandomHttp = Layer.effect(GenerateRandom, makeKmsAccountHttpBinding({
    tag: "AWS.KMS.GenerateRandom",
    operation: kms.generateRandom,
    actions: ["kms:GenerateRandom"],
}));
//# sourceMappingURL=GenerateRandomHttp.js.map