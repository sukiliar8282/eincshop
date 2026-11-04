import * as Layer from "effect/Layer";
import { GetSamplingTargets } from "./GetSamplingTargets.ts";
/**
 * HTTP implementation of the `XRay.GetSamplingTargets` binding.
 *
 * At deploy time it grants `xray:GetSamplingTargets` on `*` to the host Lambda
 * Function (the action does not support resource-level permissions); at
 * runtime it calls the X-Ray API with the function's execution role
 * credentials.
 *
 * @example Provide on the Function effect
 * ```typescript
 * import * as XRay from "alchemy/AWS/XRay";
 *
 * Effect.gen(function* () {
 *   const getSamplingTargets = yield* XRay.GetSamplingTargets();
 *   // ...
 * }).pipe(Effect.provide(XRay.GetSamplingTargetsHttp));
 * ```
 */
export declare const GetSamplingTargetsHttp: Layer.Layer<GetSamplingTargets, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GetSamplingTargetsHttp.d.ts.map