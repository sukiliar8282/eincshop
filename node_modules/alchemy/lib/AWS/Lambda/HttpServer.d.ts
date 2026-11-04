import type { ALBEvent, ALBResult, APIGatewayProxyEvent, APIGatewayProxyResult, LambdaFunctionURLEvent, LambdaFunctionURLResult } from "aws-lambda";
import * as Effect from "effect/Effect";
import type { Scope } from "effect/Scope";
import * as HttpServerRequest from "effect/unstable/http/HttpServerRequest";
import * as Http from "../../Http.ts";
export declare const isFunctionURLEvent: (event: any) => event is LambdaFunctionURLEvent;
/**
 * REST API (v1) AWS_PROXY events have a top-level `httpMethod` and a
 * `requestContext.resourcePath` field. They lack the `requestContext.http.*`
 * shape of Function URL / HTTP API (v2) events.
 */
export declare const isApiGatewayProxyEvent: (event: any) => event is APIGatewayProxyEvent;
/**
 * Application Load Balancer target events carry a `requestContext.elb` marker
 * (the target group ARN) and a top-level `httpMethod` + `path`.
 */
export declare const isAlbEvent: (event: any) => event is ALBEvent;
export declare const makeFunctionHttpHandler: <Req>(handler: Http.HttpEffect<Req>) => (event: any) => Effect.Effect<ALBResult | APIGatewayProxyResult | LambdaFunctionURLResult, never, Exclude<Effect.Services<typeof handler>, HttpServerRequest.HttpServerRequest | Scope>> | undefined;
//# sourceMappingURL=HttpServer.d.ts.map