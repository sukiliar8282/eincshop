import * as Layer from "effect/Layer";
import { ListRetrievedTraces } from "./ListRetrievedTraces.ts";
/**
 * HTTP implementation of the `XRay.ListRetrievedTraces` binding.
 *
 * At deploy time it grants `xray:ListRetrievedTraces` on `*` to the host Lambda
 * Function (the action does not support resource-level permissions); at
 * runtime it calls the X-Ray API with the function's execution role
 * credentials.
 *
 * @example Provide on the Function effect
 * ```typescript
 * import * as XRay from "alchemy/AWS/XRay";
 *
 * Effect.gen(function* () {
 *   const listRetrievedTraces = yield* XRay.ListRetrievedTraces();
 *   // ...
 * }).pipe(Effect.provide(XRay.ListRetrievedTracesHttp));
 * ```
 */
export declare const ListRetrievedTracesHttp: Layer.Layer<ListRetrievedTraces, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ListRetrievedTracesHttp.d.ts.map