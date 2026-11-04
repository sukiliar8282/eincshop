import * as Layer from "effect/Layer";
import { BatchGetTraces } from "./BatchGetTraces.ts";
/**
 * HTTP implementation of the `XRay.BatchGetTraces` binding.
 *
 * At deploy time it grants `xray:BatchGetTraces` on `*` to the host Lambda
 * Function (the action does not support resource-level permissions); at
 * runtime it calls the X-Ray API with the function's execution role
 * credentials.
 *
 * @example Provide on the Function effect
 * ```typescript
 * import * as XRay from "alchemy/AWS/XRay";
 *
 * Effect.gen(function* () {
 *   const batchGetTraces = yield* XRay.BatchGetTraces();
 *   // ...
 * }).pipe(Effect.provide(XRay.BatchGetTracesHttp));
 * ```
 */
export declare const BatchGetTracesHttp: Layer.Layer<BatchGetTraces, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=BatchGetTracesHttp.d.ts.map