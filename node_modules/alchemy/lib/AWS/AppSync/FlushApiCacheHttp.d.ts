import * as Layer from "effect/Layer";
import { FlushApiCache } from "./FlushApiCache.ts";
/**
 * HTTP implementation of the {@link FlushApiCache} binding. Calls
 * `appsync:FlushApiCache` with the Lambda's IAM role. The action defines
 * no IAM resource types, so the grant is necessarily `Resource: "*"`; the
 * runtime callable itself is fixed to the bound API's `apiId`.
 */
export declare const FlushApiCacheHttp: Layer.Layer<FlushApiCache, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=FlushApiCacheHttp.d.ts.map