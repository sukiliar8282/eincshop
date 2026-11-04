import * as Layer from "effect/Layer";
import { ResetAuthorizersCache } from "./ResetAuthorizersCache.ts";
/**
 * HTTP implementation of the {@link ResetAuthorizersCache} binding.
 * Grants `apigateway:DELETE` on the stage's `/cache/authorizers` path and
 * calls the API with the host Function's credentials.
 */
export declare const ResetAuthorizersCacheHttp: Layer.Layer<ResetAuthorizersCache, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ResetAuthorizersCacheHttp.d.ts.map