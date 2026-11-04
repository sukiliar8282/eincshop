import * as Layer from "effect/Layer";
import { UpdateThingShadow } from "./UpdateThingShadow.ts";
/**
 * HTTP implementation of the {@link UpdateThingShadow} capability — grants
 * `iot:UpdateThingShadow` on the thing ARN and calls the IoT data-plane
 * `UpdateThingShadow` API.
 */
export declare const UpdateThingShadowHttp: Layer.Layer<UpdateThingShadow, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=UpdateThingShadowHttp.d.ts.map