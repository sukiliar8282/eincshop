import * as imagebuilder from "@distilled.cloud/aws/imagebuilder";
import * as Layer from "effect/Layer";
import { makeImageBuilderAccountHttpBinding } from "./BindingHttp.js";
import { RetryImage } from "./RetryImage.js";
export const RetryImageHttp = Layer.effect(RetryImage, makeImageBuilderAccountHttpBinding({
    tag: "AWS.ImageBuilder.RetryImage",
    operation: imagebuilder.retryImage,
    actions: ["imagebuilder:RetryImage"],
}));
//# sourceMappingURL=RetryImageHttp.js.map