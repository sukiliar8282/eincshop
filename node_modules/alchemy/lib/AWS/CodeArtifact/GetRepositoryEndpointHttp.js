import * as codeartifact from "@distilled.cloud/aws/codeartifact";
import * as Layer from "effect/Layer";
import { makeRepositoryHttpBinding } from "./BindingHttp.js";
import { GetRepositoryEndpoint } from "./GetRepositoryEndpoint.js";
/** HTTP implementation of {@link GetRepositoryEndpoint} over the CodeArtifact API. */
export const GetRepositoryEndpointHttp = Layer.effect(GetRepositoryEndpoint, makeRepositoryHttpBinding({
    tag: "AWS.CodeArtifact.GetRepositoryEndpoint",
    operation: codeartifact.getRepositoryEndpoint,
    actions: ["codeartifact:GetRepositoryEndpoint"],
}));
//# sourceMappingURL=GetRepositoryEndpointHttp.js.map