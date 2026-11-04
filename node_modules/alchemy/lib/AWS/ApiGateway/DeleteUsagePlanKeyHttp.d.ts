import * as Layer from "effect/Layer";
import { DeleteUsagePlanKey } from "./DeleteUsagePlanKey.ts";
/**
 * HTTP implementation of the {@link DeleteUsagePlanKey} binding. Grants
 * `apigateway:DELETE` on the plan's per-key paths and calls the API with
 * the host Function's credentials.
 */
export declare const DeleteUsagePlanKeyHttp: Layer.Layer<DeleteUsagePlanKey, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=DeleteUsagePlanKeyHttp.d.ts.map