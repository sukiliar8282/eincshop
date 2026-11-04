import * as Layer from "effect/Layer";
import { StartTraceRetrieval } from "./StartTraceRetrieval.ts";
/**
 * HTTP implementation of the `XRay.StartTraceRetrieval` binding.
 *
 * At deploy time it grants `xray:StartTraceRetrieval` on `*` to the host Lambda
 * Function (the action does not support resource-level permissions); at
 * runtime it calls the X-Ray API with the function's execution role
 * credentials.
 *
 * @example Provide on the Function effect
 * ```typescript
 * import * as XRay from "alchemy/AWS/XRay";
 *
 * Effect.gen(function* () {
 *   const startTraceRetrieval = yield* XRay.StartTraceRetrieval();
 *   // ...
 * }).pipe(Effect.provide(XRay.StartTraceRetrievalHttp));
 * ```
 */
export declare const StartTraceRetrievalHttp: Layer.Layer<StartTraceRetrieval, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=StartTraceRetrievalHttp.d.ts.map