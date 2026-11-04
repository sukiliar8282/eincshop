import * as Layer from "effect/Layer";
import { UpdateApiKey } from "./UpdateApiKey.ts";
/**
 * HTTP implementation of the {@link UpdateApiKey} binding. Grants
 * `apigateway:PATCH` on `/apikeys/*` and calls the API with the host
 * Function's credentials.
 */
export declare const UpdateApiKeyHttp: Layer.Layer<UpdateApiKey, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=UpdateApiKeyHttp.d.ts.map