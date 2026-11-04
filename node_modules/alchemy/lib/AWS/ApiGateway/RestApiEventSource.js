import * as Context from "effect/Context";
/**
 * Event source connecting a {@link RestApi} route to the hosting Lambda
 * function.
 *
 * At deploy time the Lambda implementation (`Lambda.RestApiEventSource`)
 * materializes the path `Resource`s, the `Method` with an `AWS_PROXY`
 * integration, and the invoke `Permission` for the route — and registers
 * each of them as bindings on the API so any `Deployment` of the same API
 * is ordered after them. At runtime it dispatches matching REST proxy
 * events to the handler. Subscribe routes with {@link onRestApiRoute} and
 * provide `Lambda.RestApiEventSource` on the hosting function.
 *
 * ### Handling REST API routes
 * **Example:** Serve GET /items from a Lambda
 * ```typescript
 * export default MyFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     const api = yield* ApiGateway.RestApi("Api", {
 *       endpointConfiguration: { types: ["REGIONAL"] },
 *     });
 *
 *     yield* ApiGateway.onRestApiRoute(
 *       api,
 *       { path: "/items", httpMethod: "GET" },
 *       (event) =>
 *         Effect.succeed({
 *           statusCode: 200,
 *           body: JSON.stringify({ items: [] }),
 *         }),
 *     );
 *
 *     const deployment = yield* ApiGateway.Deployment("Release", {
 *       restApi: api,
 *     });
 *     yield* ApiGateway.Stage("Prod", {
 *       restApi: api,
 *       stageName: "prod",
 *       deploymentId: deployment.deploymentId,
 *     });
 *
 *     return {};
 *   }).pipe(Effect.provide(Lambda.RestApiEventSource)),
 * );
 * ```
 *
 * @binding
 */
export class RestApiEventSource extends Context.Service()("AWS.ApiGateway.RestApiEventSource") {
}
/**
 * Subscribe an Effect handler to a route of an API Gateway v1
 * {@link RestApi}.
 *
 * Provide `Lambda.RestApiEventSource` on the hosting function to satisfy
 * the requirement.
 *
 * @param api The REST API.
 * @param props The path + verb to serve.
 * @param handler Invoked once per proxy event for the route.
 *
 * @example
 * ```typescript
 * yield* ApiGateway.onRestApiRoute(api, { path: "/", httpMethod: "GET" }, () =>
 *   Effect.succeed({ statusCode: 200, body: "ok" }),
 * );
 * ```
 */
export function onRestApiRoute(api, props, handler) {
    return RestApiEventSource.use((source) => source(api, props, handler));
}
//# sourceMappingURL=RestApiEventSource.js.map