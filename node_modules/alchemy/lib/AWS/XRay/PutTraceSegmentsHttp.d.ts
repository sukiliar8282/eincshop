import * as Layer from "effect/Layer";
import { PutTraceSegments } from "./PutTraceSegments.ts";
/**
 * HTTP implementation of the `XRay.PutTraceSegments` binding.
 *
 * At deploy time it grants `xray:PutTraceSegments` on `*` to the host Lambda
 * Function (the action does not support resource-level permissions); at
 * runtime it calls the X-Ray API with the function's execution role
 * credentials.
 *
 * @example Provide on the Function effect
 * ```typescript
 * import * as XRay from "alchemy/AWS/XRay";
 *
 * Effect.gen(function* () {
 *   const putTraceSegments = yield* XRay.PutTraceSegments();
 *   // ...
 * }).pipe(Effect.provide(XRay.PutTraceSegmentsHttp));
 * ```
 */
export declare const PutTraceSegmentsHttp: Layer.Layer<PutTraceSegments, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=PutTraceSegmentsHttp.d.ts.map