import * as Layer from "effect/Layer";
import { PutTelemetryRecords } from "./PutTelemetryRecords.ts";
/**
 * HTTP implementation of the `XRay.PutTelemetryRecords` binding.
 *
 * At deploy time it grants `xray:PutTelemetryRecords` on `*` to the host Lambda
 * Function (the action does not support resource-level permissions); at
 * runtime it calls the X-Ray API with the function's execution role
 * credentials.
 *
 * @example Provide on the Function effect
 * ```typescript
 * import * as XRay from "alchemy/AWS/XRay";
 *
 * Effect.gen(function* () {
 *   const putTelemetryRecords = yield* XRay.PutTelemetryRecords();
 *   // ...
 * }).pipe(Effect.provide(XRay.PutTelemetryRecordsHttp));
 * ```
 */
export declare const PutTelemetryRecordsHttp: Layer.Layer<PutTelemetryRecords, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=PutTelemetryRecordsHttp.d.ts.map