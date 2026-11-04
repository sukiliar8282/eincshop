import * as Layer from "effect/Layer";
import { CreateAPIKey, DeleteAPIKey, GetDecryptedAPIKey, ListAPIKeys } from "./APIKeys.ts";
export declare const CreateAPIKeyHttp: Layer.Layer<CreateAPIKey, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
export declare const GetDecryptedAPIKeyHttp: Layer.Layer<GetDecryptedAPIKey, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
export declare const ListAPIKeysHttp: Layer.Layer<ListAPIKeys, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
export declare const DeleteAPIKeyHttp: Layer.Layer<DeleteAPIKey, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=APIKeysHttp.d.ts.map