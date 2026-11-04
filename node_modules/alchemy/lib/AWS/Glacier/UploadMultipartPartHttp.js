import * as glacier from "@distilled.cloud/aws/glacier";
import * as Layer from "effect/Layer";
import { makeGlacierVaultHttpBinding } from "./BindingHttp.js";
import { UploadMultipartPart } from "./UploadMultipartPart.js";
export const UploadMultipartPartHttp = Layer.effect(UploadMultipartPart, makeGlacierVaultHttpBinding({
    tag: "AWS.Glacier.UploadMultipartPart",
    operation: glacier.uploadMultipartPart,
    actions: ["glacier:UploadMultipartPart"],
}));
//# sourceMappingURL=UploadMultipartPartHttp.js.map