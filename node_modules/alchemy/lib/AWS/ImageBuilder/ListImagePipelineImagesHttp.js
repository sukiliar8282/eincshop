import * as imagebuilder from "@distilled.cloud/aws/imagebuilder";
import * as Layer from "effect/Layer";
import { makeImageBuilderPipelineHttpBinding } from "./BindingHttp.js";
import { ListImagePipelineImages } from "./ListImagePipelineImages.js";
export const ListImagePipelineImagesHttp = Layer.effect(ListImagePipelineImages, makeImageBuilderPipelineHttpBinding({
    tag: "AWS.ImageBuilder.ListImagePipelineImages",
    operation: imagebuilder.listImagePipelineImages,
    actions: ["imagebuilder:ListImagePipelineImages"],
}));
//# sourceMappingURL=ListImagePipelineImagesHttp.js.map