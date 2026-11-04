import type lambda from "aws-lambda";
import * as Layer from "effect/Layer";
import { WebSocketEventSource as AGW2WebSocketEventSource } from "../ApiGatewayV2/WebSocketEventSource.ts";
import * as Lambda from "./Function.ts";
export declare const isWebSocketEvent: (event: any) => event is lambda.APIGatewayProxyWebsocketEventV2;
/**
 * Connects a WebSocket API route to the current Lambda function.
 *
 * At deploy time this layer materializes the `AWS_PROXY` Integration, the
 * Route, and the API Gateway invoke Permission for each registered route
 * key; at runtime it dispatches matching WebSocket proxy events to the
 * registered handler.
 * ### Handling WebSocket routes
 * **Example:** Echo server
 * ```typescript
 * const connections = yield* AWS.ApiGatewayV2.ManageConnections(stage);
 *
 * yield* AWS.ApiGatewayV2.onWebSocketRoute(api, { routeKey: "$connect" }, () =>
 *   Effect.succeed({ statusCode: 200 }),
 * );
 * yield* AWS.ApiGatewayV2.onWebSocketRoute(api, { routeKey: "$default" }, (event) =>
 *   connections
 *     .postToConnection({
 *       ConnectionId: event.requestContext.connectionId,
 *       Data: `echo:${event.body ?? ""}`,
 *     })
 *     .pipe(
 *       Effect.asVoid,
 *       Effect.catchTag("GoneException", () => Effect.void),
 *       Effect.orDie,
 *     ),
 * );
 * ```
 *
 * @binding
 */
export declare const WebSocketEventSource: Layer.Layer<AGW2WebSocketEventSource, never, Lambda.Function>;
//# sourceMappingURL=WebSocketEventSource.d.ts.map