import * as codeartifact from "@distilled.cloud/aws/codeartifact";
import * as Layer from "effect/Layer";
import { makeRepositoryHttpBinding, packageArns } from "./BindingHttp.js";
import { PublishPackageVersion } from "./PublishPackageVersion.js";
/** HTTP implementation of {@link PublishPackageVersion} over the CodeArtifact API. */
export const PublishPackageVersionHttp = Layer.effect(PublishPackageVersion, makeRepositoryHttpBinding({
    tag: "AWS.CodeArtifact.PublishPackageVersion",
    operation: codeartifact.publishPackageVersion,
    actions: ["codeartifact:PublishPackageVersion"],
    resources: packageArns,
}));
//# sourceMappingURL=PublishPackageVersionHttp.js.map