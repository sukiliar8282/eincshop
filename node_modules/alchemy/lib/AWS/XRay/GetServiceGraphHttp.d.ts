import * as Layer from "effect/Layer";
import { GetServiceGraph } from "./GetServiceGraph.ts";
/**
 * HTTP implementation of the `XRay.GetServiceGraph` binding.
 *
 * At deploy time it grants `xray:GetServiceGraph` on `*` to the host Lambda
 * Function (the action does not support resource-level permissions); at
 * runtime it calls the X-Ray API with the function's execution role
 * credentials.
 *
 * @example Provide on the Function effect
 * ```typescript
 * import * as XRay from "alchemy/AWS/XRay";
 *
 * Effect.gen(function* () {
 *   const getServiceGraph = yield* XRay.GetServiceGraph();
 *   // ...
 * }).pipe(Effect.provide(XRay.GetServiceGraphHttp));
 * ```
 */
export declare const GetServiceGraphHttp: Layer.Layer<GetServiceGraph, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GetServiceGraphHttp.d.ts.map