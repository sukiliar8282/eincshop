import * as Layer from "effect/Layer";
import { FlushStageAuthorizersCache } from "./FlushStageAuthorizersCache.ts";
/**
 * HTTP implementation of the {@link FlushStageAuthorizersCache} binding.
 * Grants `apigateway:DELETE` on the stage's `/cache/authorizers` path and
 * calls the API with the host Function's credentials.
 */
export declare const FlushStageAuthorizersCacheHttp: Layer.Layer<FlushStageAuthorizersCache, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=FlushStageAuthorizersCacheHttp.d.ts.map