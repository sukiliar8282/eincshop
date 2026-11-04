import * as Layer from "effect/Layer";
import { CancelTraceRetrieval } from "./CancelTraceRetrieval.ts";
/**
 * HTTP implementation of the `XRay.CancelTraceRetrieval` binding.
 *
 * At deploy time it grants `xray:CancelTraceRetrieval` on `*` to the host Lambda
 * Function (the action does not support resource-level permissions); at
 * runtime it calls the X-Ray API with the function's execution role
 * credentials.
 *
 * @example Provide on the Function effect
 * ```typescript
 * import * as XRay from "alchemy/AWS/XRay";
 *
 * Effect.gen(function* () {
 *   const cancelTraceRetrieval = yield* XRay.CancelTraceRetrieval();
 *   // ...
 * }).pipe(Effect.provide(XRay.CancelTraceRetrievalHttp));
 * ```
 */
export declare const CancelTraceRetrievalHttp: Layer.Layer<CancelTraceRetrieval, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=CancelTraceRetrievalHttp.d.ts.map