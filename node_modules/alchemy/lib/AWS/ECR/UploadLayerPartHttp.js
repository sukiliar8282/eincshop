import * as ecr from "@distilled.cloud/aws/ecr";
import * as Layer from "effect/Layer";
import { makeEcrRepositoryHttpBinding } from "./BindingHttp.js";
import { UploadLayerPart } from "./UploadLayerPart.js";
/** HTTP implementation of {@link UploadLayerPart} over the ECR API. */
export const UploadLayerPartHttp = Layer.effect(UploadLayerPart, makeEcrRepositoryHttpBinding({
    capability: "UploadLayerPart",
    operation: ecr.uploadLayerPart,
    iamActions: ["ecr:UploadLayerPart"],
}));
//# sourceMappingURL=UploadLayerPartHttp.js.map