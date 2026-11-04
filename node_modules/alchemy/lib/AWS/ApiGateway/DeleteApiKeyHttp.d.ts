import * as Layer from "effect/Layer";
import { DeleteApiKey } from "./DeleteApiKey.ts";
/**
 * HTTP implementation of the {@link DeleteApiKey} binding. Grants
 * `apigateway:DELETE` on `/apikeys/*` and calls the API with the host
 * Function's credentials.
 */
export declare const DeleteApiKeyHttp: Layer.Layer<DeleteApiKey, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=DeleteApiKeyHttp.d.ts.map