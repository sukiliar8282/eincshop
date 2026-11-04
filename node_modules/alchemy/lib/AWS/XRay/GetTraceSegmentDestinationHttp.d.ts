import * as Layer from "effect/Layer";
import { GetTraceSegmentDestination } from "./GetTraceSegmentDestination.ts";
/**
 * HTTP implementation of the `XRay.GetTraceSegmentDestination` binding.
 *
 * At deploy time it grants `xray:GetTraceSegmentDestination` on `*` to the host Lambda
 * Function (the action does not support resource-level permissions); at
 * runtime it calls the X-Ray API with the function's execution role
 * credentials.
 *
 * @example Provide on the Function effect
 * ```typescript
 * import * as XRay from "alchemy/AWS/XRay";
 *
 * Effect.gen(function* () {
 *   const getTraceSegmentDestination = yield* XRay.GetTraceSegmentDestination();
 *   // ...
 * }).pipe(Effect.provide(XRay.GetTraceSegmentDestinationHttp));
 * ```
 */
export declare const GetTraceSegmentDestinationHttp: Layer.Layer<GetTraceSegmentDestination, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GetTraceSegmentDestinationHttp.d.ts.map