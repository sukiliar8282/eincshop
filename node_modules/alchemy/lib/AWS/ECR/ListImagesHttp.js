import * as ecr from "@distilled.cloud/aws/ecr";
import * as Layer from "effect/Layer";
import { makeEcrRepositoryHttpBinding } from "./BindingHttp.js";
import { ListImages } from "./ListImages.js";
/** HTTP implementation of {@link ListImages} over the ECR API. */
export const ListImagesHttp = Layer.effect(ListImages, makeEcrRepositoryHttpBinding({
    capability: "ListImages",
    operation: ecr.listImages,
    iamActions: ["ecr:ListImages"],
}));
//# sourceMappingURL=ListImagesHttp.js.map