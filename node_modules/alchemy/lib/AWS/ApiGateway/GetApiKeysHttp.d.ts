import * as Layer from "effect/Layer";
import { GetApiKeys } from "./GetApiKeys.ts";
/**
 * HTTP implementation of the {@link GetApiKeys} binding. Grants
 * `apigateway:GET` on `/apikeys` and calls the API with the host
 * Function's credentials.
 */
export declare const GetApiKeysHttp: Layer.Layer<GetApiKeys, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GetApiKeysHttp.d.ts.map