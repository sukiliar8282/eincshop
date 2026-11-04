import * as Layer from "effect/Layer";
import { CreateUsagePlanKey } from "./CreateUsagePlanKey.ts";
/**
 * HTTP implementation of the {@link CreateUsagePlanKey} binding. Grants
 * `apigateway:POST` on the plan's `/keys` path and calls the API with the
 * host Function's credentials.
 */
export declare const CreateUsagePlanKeyHttp: Layer.Layer<CreateUsagePlanKey, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=CreateUsagePlanKeyHttp.d.ts.map