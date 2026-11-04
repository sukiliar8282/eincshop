import * as kms from "@distilled.cloud/aws/kms";
import * as Layer from "effect/Layer";
import { makeKmsKeyHttpBinding } from "./BindingHttp.js";
import { GenerateMac } from "./GenerateMac.js";
export const GenerateMacHttp = Layer.effect(GenerateMac, makeKmsKeyHttpBinding({
    tag: "AWS.KMS.GenerateMac",
    operation: kms.generateMac,
    actions: ["kms:GenerateMac"],
}));
//# sourceMappingURL=GenerateMacHttp.js.map