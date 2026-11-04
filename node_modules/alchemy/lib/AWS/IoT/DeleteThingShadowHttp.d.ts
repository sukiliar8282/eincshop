import * as Layer from "effect/Layer";
import { DeleteThingShadow } from "./DeleteThingShadow.ts";
/**
 * HTTP implementation of the {@link DeleteThingShadow} capability — grants
 * `iot:DeleteThingShadow` on the thing ARN and calls the IoT data-plane
 * `DeleteThingShadow` API.
 */
export declare const DeleteThingShadowHttp: Layer.Layer<DeleteThingShadow, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=DeleteThingShadowHttp.d.ts.map