import * as Layer from "effect/Layer";
import { ManageConnections } from "./ManageConnections.ts";
/**
 * HTTP implementation of the {@link ManageConnections} binding. Signs
 * `@connections` requests with the Lambda's IAM role against the stage's
 * callback endpoint.
 *
 * Provide it on the hosting Lambda function's Effect so the binding is
 * available at runtime:
 *
 * @example
 * ```typescript
 * export default MyFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     const connections = yield* ApiGatewayV2.ManageConnections(stage);
 *     // ... register WebSocket routes that push via `connections`
 *     return {};
 *   }).pipe(Effect.provide(ApiGatewayV2.ManageConnectionsHttp)),
 * );
 * ```
 */
export declare const ManageConnectionsHttp: Layer.Layer<ManageConnections, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ManageConnectionsHttp.d.ts.map