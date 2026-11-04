import type lambda from "aws-lambda";
import * as Layer from "effect/Layer";
import { RestApiEventSource as AGRestApiEventSource } from "../ApiGateway/RestApiEventSource.ts";
import * as Lambda from "./Function.ts";
export declare const isRestApiEvent: (event: any) => event is lambda.APIGatewayProxyEvent;
/**
 * Connects a REST API (v1) route to the current Lambda function.
 *
 * At deploy time this layer materializes the path `Resource` chain, the
 * `Method` with an `AWS_PROXY` integration, and the API Gateway invoke
 * `Permission` for each registered route — and registers each child as a
 * `RestApiBinding` on the API so any `Deployment` of the same API is
 * ordered after them. At runtime it dispatches matching REST proxy events
 * to the registered handler.
 * ### Handling REST API routes
 * **Example:** JSON endpoint
 * ```typescript
 * yield* AWS.ApiGateway.onRestApiRoute(
 *   api,
 *   { path: "/items", httpMethod: "GET" },
 *   () =>
 *     Effect.succeed({
 *       statusCode: 200,
 *       body: JSON.stringify({ items: [] }),
 *     }),
 * );
 * ```
 *
 * @binding
 */
export declare const RestApiEventSource: Layer.Layer<AGRestApiEventSource, never, Lambda.Function>;
//# sourceMappingURL=RestApiEventSource.d.ts.map