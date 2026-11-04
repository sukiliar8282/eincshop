import * as imagebuilder from "@distilled.cloud/aws/imagebuilder";
import * as Layer from "effect/Layer";
import { makeImageBuilderAccountHttpBinding } from "./BindingHttp.js";
import { ListImages } from "./ListImages.js";
export const ListImagesHttp = Layer.effect(ListImages, makeImageBuilderAccountHttpBinding({
    tag: "AWS.ImageBuilder.ListImages",
    operation: imagebuilder.listImages,
    actions: ["imagebuilder:ListImages"],
}));
//# sourceMappingURL=ListImagesHttp.js.map