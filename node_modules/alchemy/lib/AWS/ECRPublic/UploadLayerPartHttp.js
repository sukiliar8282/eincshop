import * as ecrpublic from "@distilled.cloud/aws/ecr-public";
import * as Layer from "effect/Layer";
import { makePublicRepositoryHttpBinding } from "./BindingHttp.js";
import { UploadLayerPart } from "./UploadLayerPart.js";
export const UploadLayerPartHttp = Layer.effect(UploadLayerPart, makePublicRepositoryHttpBinding({
    capability: "UploadLayerPart",
    iamActions: ["ecr-public:UploadLayerPart"],
    operation: ecrpublic.uploadLayerPart,
}));
//# sourceMappingURL=UploadLayerPartHttp.js.map