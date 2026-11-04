import * as Context from "effect/Context";
/**
 * Event source connecting a WebSocket {@link Api} route to the hosting
 * Lambda function.
 *
 * At deploy time the Lambda implementation (`Lambda.WebSocketEventSource`)
 * materializes the `Integration`, `Route`, and invoke `Permission` for the
 * route; at runtime it dispatches matching WebSocket proxy events to the
 * handler. Subscribe routes with {@link onWebSocketRoute} and provide
 * `Lambda.WebSocketEventSource` on the hosting function.
 *
 * ### Handling WebSocket Routes
 * **Example:** Echo server on a WEBSOCKET Api
 * ```typescript
 * export default MyFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     const api = yield* ApiGatewayV2.Api("WsApi", {
 *       protocolType: "WEBSOCKET",
 *       routeSelectionExpression: "$request.body.action",
 *     });
 *     const stage = yield* ApiGatewayV2.Stage("WsStage", {
 *       api,
 *       stageName: "prod",
 *       autoDeploy: true,
 *     });
 *     const connections = yield* ApiGatewayV2.ManageConnections(stage);
 *
 *     yield* ApiGatewayV2.onWebSocketRoute(api, { routeKey: "$connect" }, () =>
 *       Effect.succeed({ statusCode: 200 }),
 *     );
 *
 *     yield* ApiGatewayV2.onWebSocketRoute(api, { routeKey: "$default" }, (event) =>
 *       connections
 *         .postToConnection({
 *           ConnectionId: event.requestContext.connectionId,
 *           Data: `echo:${event.body ?? ""}`,
 *         })
 *         .pipe(
 *           Effect.asVoid,
 *           Effect.catchTag("GoneException", () => Effect.void),
 *           Effect.orDie,
 *         ),
 *     );
 *
 *     return {};
 *   }).pipe(
 *     Effect.provide(
 *       Layer.mergeAll(
 *         Lambda.WebSocketEventSource,
 *         ApiGatewayV2.ManageConnectionsHttp,
 *       ),
 *     ),
 *   ),
 * );
 * ```
 *
 * @binding
 */
export class WebSocketEventSource extends Context.Service()("AWS.ApiGatewayV2.WebSocketEventSource") {
}
/**
 * Subscribe an Effect handler to a WebSocket route of an API Gateway v2
 * WEBSOCKET {@link Api}.
 *
 * Provide `Lambda.WebSocketEventSource` on the hosting function to
 * satisfy the requirement.
 *
 * @param api The WebSocket API.
 * @param props The route key to serve.
 * @param handler Invoked once per WebSocket event for the route.
 *
 * @example
 * ```typescript
 * yield* ApiGatewayV2.onWebSocketRoute(api, { routeKey: "$connect" }, () =>
 *   Effect.succeed({ statusCode: 200 }),
 * );
 * ```
 */
export function onWebSocketRoute(api, props, handler) {
    return WebSocketEventSource.use((source) => source(api, props, handler));
}
//# sourceMappingURL=WebSocketEventSource.js.map