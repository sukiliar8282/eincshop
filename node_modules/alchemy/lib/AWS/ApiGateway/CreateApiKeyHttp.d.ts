import * as Layer from "effect/Layer";
import { CreateApiKey } from "./CreateApiKey.ts";
/**
 * HTTP implementation of the {@link CreateApiKey} binding. Grants
 * `apigateway:POST` on `/apikeys` and calls the API with the host
 * Function's credentials.
 */
export declare const CreateApiKeyHttp: Layer.Layer<CreateApiKey, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=CreateApiKeyHttp.d.ts.map