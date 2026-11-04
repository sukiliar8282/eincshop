import * as Layer from "effect/Layer";
import { GetApiKey } from "./GetApiKey.ts";
/**
 * HTTP implementation of the {@link GetApiKey} binding. Grants
 * `apigateway:GET` on `/apikeys/*` and calls the API with the host
 * Function's credentials.
 */
export declare const GetApiKeyHttp: Layer.Layer<GetApiKey, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GetApiKeyHttp.d.ts.map