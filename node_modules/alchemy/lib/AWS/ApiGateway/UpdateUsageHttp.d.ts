import * as Layer from "effect/Layer";
import { UpdateUsage } from "./UpdateUsage.ts";
/**
 * HTTP implementation of the {@link UpdateUsage} binding. Grants
 * `apigateway:PATCH` on the plan's per-key `/usage` paths and calls the
 * API with the host Function's credentials.
 */
export declare const UpdateUsageHttp: Layer.Layer<UpdateUsage, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=UpdateUsageHttp.d.ts.map