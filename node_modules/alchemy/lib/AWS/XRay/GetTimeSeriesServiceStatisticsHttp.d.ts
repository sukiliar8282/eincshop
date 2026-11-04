import * as Layer from "effect/Layer";
import { GetTimeSeriesServiceStatistics } from "./GetTimeSeriesServiceStatistics.ts";
/**
 * HTTP implementation of the `XRay.GetTimeSeriesServiceStatistics` binding.
 *
 * At deploy time it grants `xray:GetTimeSeriesServiceStatistics` on `*` to the host Lambda
 * Function (the action does not support resource-level permissions); at
 * runtime it calls the X-Ray API with the function's execution role
 * credentials.
 *
 * @example Provide on the Function effect
 * ```typescript
 * import * as XRay from "alchemy/AWS/XRay";
 *
 * Effect.gen(function* () {
 *   const getTimeSeriesServiceStatistics = yield* XRay.GetTimeSeriesServiceStatistics();
 *   // ...
 * }).pipe(Effect.provide(XRay.GetTimeSeriesServiceStatisticsHttp));
 * ```
 */
export declare const GetTimeSeriesServiceStatisticsHttp: Layer.Layer<GetTimeSeriesServiceStatistics, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GetTimeSeriesServiceStatisticsHttp.d.ts.map