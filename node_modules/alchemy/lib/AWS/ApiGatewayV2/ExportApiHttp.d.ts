import * as Layer from "effect/Layer";
import { ExportApi } from "./ExportApi.ts";
/**
 * HTTP implementation of the {@link ExportApi} binding. Grants
 * `apigateway:GET` on the API's `/exports/*` path and calls the API with
 * the host Function's credentials.
 */
export declare const ExportApiHttp: Layer.Layer<ExportApi, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ExportApiHttp.d.ts.map