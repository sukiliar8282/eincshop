import * as Layer from "effect/Layer";
import { GetTraceSummaries } from "./GetTraceSummaries.ts";
/**
 * HTTP implementation of the `XRay.GetTraceSummaries` binding.
 *
 * At deploy time it grants `xray:GetTraceSummaries` on `*` to the host Lambda
 * Function (the action does not support resource-level permissions); at
 * runtime it calls the X-Ray API with the function's execution role
 * credentials.
 *
 * @example Provide on the Function effect
 * ```typescript
 * import * as XRay from "alchemy/AWS/XRay";
 *
 * Effect.gen(function* () {
 *   const getTraceSummaries = yield* XRay.GetTraceSummaries();
 *   // ...
 * }).pipe(Effect.provide(XRay.GetTraceSummariesHttp));
 * ```
 */
export declare const GetTraceSummariesHttp: Layer.Layer<GetTraceSummaries, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GetTraceSummariesHttp.d.ts.map