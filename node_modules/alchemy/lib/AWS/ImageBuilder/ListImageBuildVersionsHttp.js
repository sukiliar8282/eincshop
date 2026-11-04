import * as imagebuilder from "@distilled.cloud/aws/imagebuilder";
import * as Layer from "effect/Layer";
import { makeImageBuilderAccountHttpBinding } from "./BindingHttp.js";
import { ListImageBuildVersions } from "./ListImageBuildVersions.js";
export const ListImageBuildVersionsHttp = Layer.effect(ListImageBuildVersions, makeImageBuilderAccountHttpBinding({
    tag: "AWS.ImageBuilder.ListImageBuildVersions",
    operation: imagebuilder.listImageBuildVersions,
    actions: ["imagebuilder:ListImageBuildVersions"],
}));
//# sourceMappingURL=ListImageBuildVersionsHttp.js.map