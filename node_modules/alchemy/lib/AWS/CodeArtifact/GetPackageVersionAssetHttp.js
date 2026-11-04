import * as codeartifact from "@distilled.cloud/aws/codeartifact";
import * as Layer from "effect/Layer";
import { makeRepositoryHttpBinding, packageArns } from "./BindingHttp.js";
import { GetPackageVersionAsset } from "./GetPackageVersionAsset.js";
/** HTTP implementation of {@link GetPackageVersionAsset} over the CodeArtifact API. */
export const GetPackageVersionAssetHttp = Layer.effect(GetPackageVersionAsset, makeRepositoryHttpBinding({
    tag: "AWS.CodeArtifact.GetPackageVersionAsset",
    operation: codeartifact.getPackageVersionAsset,
    actions: ["codeartifact:GetPackageVersionAsset"],
    resources: packageArns,
}));
//# sourceMappingURL=GetPackageVersionAssetHttp.js.map