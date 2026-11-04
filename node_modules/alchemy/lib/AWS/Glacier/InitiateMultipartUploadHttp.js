import * as glacier from "@distilled.cloud/aws/glacier";
import * as Layer from "effect/Layer";
import { makeGlacierVaultHttpBinding } from "./BindingHttp.js";
import { InitiateMultipartUpload } from "./InitiateMultipartUpload.js";
export const InitiateMultipartUploadHttp = Layer.effect(InitiateMultipartUpload, makeGlacierVaultHttpBinding({
    tag: "AWS.Glacier.InitiateMultipartUpload",
    operation: glacier.initiateMultipartUpload,
    actions: ["glacier:InitiateMultipartUpload"],
}));
//# sourceMappingURL=InitiateMultipartUploadHttp.js.map