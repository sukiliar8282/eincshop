import * as Layer from "effect/Layer";
import { GetSamplingStatisticSummaries } from "./GetSamplingStatisticSummaries.ts";
/**
 * HTTP implementation of the `XRay.GetSamplingStatisticSummaries` binding.
 *
 * At deploy time it grants `xray:GetSamplingStatisticSummaries` on `*` to the host Lambda
 * Function (the action does not support resource-level permissions); at
 * runtime it calls the X-Ray API with the function's execution role
 * credentials.
 *
 * @example Provide on the Function effect
 * ```typescript
 * import * as XRay from "alchemy/AWS/XRay";
 *
 * Effect.gen(function* () {
 *   const getSamplingStatisticSummaries = yield* XRay.GetSamplingStatisticSummaries();
 *   // ...
 * }).pipe(Effect.provide(XRay.GetSamplingStatisticSummariesHttp));
 * ```
 */
export declare const GetSamplingStatisticSummariesHttp: Layer.Layer<GetSamplingStatisticSummaries, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GetSamplingStatisticSummariesHttp.d.ts.map