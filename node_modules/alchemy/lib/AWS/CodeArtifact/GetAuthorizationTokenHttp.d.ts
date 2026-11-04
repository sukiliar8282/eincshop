import * as Layer from "effect/Layer";
import { GetAuthorizationToken } from "./GetAuthorizationToken.ts";
/**
 * HTTP implementation of {@link GetAuthorizationToken} over the CodeArtifact
 * API. Domain-scoped (not repository-scoped): tokens authorize against every
 * repository in the domain, and CodeArtifact exchanges the caller's
 * credentials via `sts:GetServiceBearerToken`.
 */
export declare const GetAuthorizationTokenHttp: Layer.Layer<GetAuthorizationToken, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GetAuthorizationTokenHttp.d.ts.map