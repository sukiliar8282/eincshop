import * as Layer from "effect/Layer";
import { GetInsight } from "./GetInsight.ts";
/**
 * HTTP implementation of the `XRay.GetInsight` binding.
 *
 * At deploy time it grants `xray:GetInsight` on `*` to the host Lambda
 * Function (the action does not support resource-level permissions); at
 * runtime it calls the X-Ray API with the function's execution role
 * credentials.
 *
 * @example Provide on the Function effect
 * ```typescript
 * import * as XRay from "alchemy/AWS/XRay";
 *
 * Effect.gen(function* () {
 *   const getInsight = yield* XRay.GetInsight();
 *   // ...
 * }).pipe(Effect.provide(XRay.GetInsightHttp));
 * ```
 */
export declare const GetInsightHttp: Layer.Layer<GetInsight, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GetInsightHttp.d.ts.map