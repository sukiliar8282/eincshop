import * as Layer from "effect/Layer";
import { GetUsage } from "./GetUsage.ts";
/**
 * HTTP implementation of the {@link GetUsage} binding. Grants
 * `apigateway:GET` on the plan's `/usage` path and calls the API with the
 * host Function's credentials.
 */
export declare const GetUsageHttp: Layer.Layer<GetUsage, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GetUsageHttp.d.ts.map