import * as Layer from "effect/Layer";
import { GetUsagePlanKey } from "./GetUsagePlanKey.ts";
/**
 * HTTP implementation of the {@link GetUsagePlanKey} binding. Grants
 * `apigateway:GET` on the plan's per-key paths and calls the API with the
 * host Function's credentials.
 */
export declare const GetUsagePlanKeyHttp: Layer.Layer<GetUsagePlanKey, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GetUsagePlanKeyHttp.d.ts.map