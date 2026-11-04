import * as Layer from "effect/Layer";
import { GetRetrievedTracesGraph } from "./GetRetrievedTracesGraph.ts";
/**
 * HTTP implementation of the `XRay.GetRetrievedTracesGraph` binding.
 *
 * At deploy time it grants `xray:GetRetrievedTracesGraph` on `*` to the host Lambda
 * Function (the action does not support resource-level permissions); at
 * runtime it calls the X-Ray API with the function's execution role
 * credentials.
 *
 * @example Provide on the Function effect
 * ```typescript
 * import * as XRay from "alchemy/AWS/XRay";
 *
 * Effect.gen(function* () {
 *   const getRetrievedTracesGraph = yield* XRay.GetRetrievedTracesGraph();
 *   // ...
 * }).pipe(Effect.provide(XRay.GetRetrievedTracesGraphHttp));
 * ```
 */
export declare const GetRetrievedTracesGraphHttp: Layer.Layer<GetRetrievedTracesGraph, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GetRetrievedTracesGraphHttp.d.ts.map