import * as codeartifact from "@distilled.cloud/aws/codeartifact";
import * as Layer from "effect/Layer";
import { makeRepositoryHttpBinding, packageArns } from "./BindingHttp.js";
import { ListPackageVersionAssets } from "./ListPackageVersionAssets.js";
/** HTTP implementation of {@link ListPackageVersionAssets} over the CodeArtifact API. */
export const ListPackageVersionAssetsHttp = Layer.effect(ListPackageVersionAssets, makeRepositoryHttpBinding({
    tag: "AWS.CodeArtifact.ListPackageVersionAssets",
    operation: codeartifact.listPackageVersionAssets,
    actions: ["codeartifact:ListPackageVersionAssets"],
    resources: packageArns,
}));
//# sourceMappingURL=ListPackageVersionAssetsHttp.js.map