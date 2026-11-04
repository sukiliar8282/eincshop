import * as ecr from "@distilled.cloud/aws/ecr";
import * as Layer from "effect/Layer";
import { makeEcrRepositoryHttpBinding } from "./BindingHttp.js";
import { PutImage } from "./PutImage.js";
/** HTTP implementation of {@link PutImage} over the ECR API. */
export const PutImageHttp = Layer.effect(PutImage, makeEcrRepositoryHttpBinding({
    capability: "PutImage",
    operation: ecr.putImage,
    iamActions: ["ecr:PutImage"],
}));
//# sourceMappingURL=PutImageHttp.js.map