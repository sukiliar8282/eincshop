import * as imagebuilder from "@distilled.cloud/aws/imagebuilder";
import * as Layer from "effect/Layer";
import { makeImageBuilderAccountHttpBinding } from "./BindingHttp.js";
import { ListImagePackages } from "./ListImagePackages.js";
export const ListImagePackagesHttp = Layer.effect(ListImagePackages, makeImageBuilderAccountHttpBinding({
    tag: "AWS.ImageBuilder.ListImagePackages",
    operation: imagebuilder.listImagePackages,
    actions: ["imagebuilder:ListImagePackages"],
}));
//# sourceMappingURL=ListImagePackagesHttp.js.map