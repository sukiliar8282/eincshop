import * as Layer from "effect/Layer";
import { GetThingShadow } from "./GetThingShadow.ts";
/**
 * HTTP implementation of the {@link GetThingShadow} capability — grants
 * `iot:GetThingShadow` on the thing ARN and calls the IoT data-plane
 * `GetThingShadow` API.
 */
export declare const GetThingShadowHttp: Layer.Layer<GetThingShadow, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GetThingShadowHttp.d.ts.map