import * as agw2 from "@distilled.cloud/aws/apigatewayv2";
import * as Effect from "effect/Effect";
import * as Namespace from "../../Namespace.js";
import * as Output from "../../Output.js";
import { Permission } from "../Lambda/Permission.js";
import { Api } from "./Api.js";
import { Integration } from "./Integration.js";
import { Route } from "./Route.js";
import { Stage } from "./Stage.js";
/**
 * The flagship HTTP API → Lambda front door: composes an {@link Api}
 * (HTTP), an `AWS_PROXY` {@link Integration} (payload 2.0), a `$default`
 * {@link Route}, an auto-deployed {@link Stage}, and the API Gateway
 * invoke `Permission` in one call.
 *
 * The Lambda receives the same event shape as a Function URL, so an
 * Effect-native `fetch` handler works unchanged behind the API.
 *
 * ### Creating an HTTP API
 * **Example:** Front a Lambda function
 * ```typescript
 * const fn = yield* MyFunction;
 * const { url } = yield* ApiGatewayV2.HttpApi("Api", { handler: fn });
 * // url -> https://{apiId}.execute-api.{region}.amazonaws.com
 * ```
 *
 * **Example:** With CORS and a named stage
 * ```typescript
 * const { api, stage, url } = yield* ApiGatewayV2.HttpApi("Api", {
 *   handler: fn,
 *   stageName: "prod",
 *   cors: { AllowOrigins: ["*"], AllowMethods: ["*"] },
 * });
 * ```
 */
export const HttpApi = (id, props) => Namespace.push(id, Effect.gen(function* () {
    const api = yield* Api("Api", {
        name: props.name,
        protocolType: "HTTP",
        description: props.description,
        corsConfiguration: props.cors,
        disableExecuteApiEndpoint: props.disableExecuteApiEndpoint,
        tags: props.tags,
    });
    const integration = yield* Integration("Integration", {
        api,
        integrationType: "AWS_PROXY",
        integrationUri: props.handler.functionArn,
        payloadFormatVersion: "2.0",
        timeout: props.timeout,
    });
    yield* Route("Default", {
        api,
        routeKey: "$default",
        integration,
    });
    const stage = yield* Stage("Stage", {
        api,
        stageName: props.stageName ?? "$default",
        autoDeploy: true,
        tags: props.tags,
    });
    yield* Permission("Permission", {
        action: "lambda:InvokeFunction",
        functionName: props.handler.functionName,
        principal: "apigateway.amazonaws.com",
        sourceArn: Output.map(Output.all(props.handler.functionArn, api.apiId), ([fnArn, apiId]) => {
            const [, , , region, accountId] = fnArn.split(":");
            return `arn:aws:execute-api:${region}:${accountId}:${apiId}/*`;
        }),
    });
    return {
        /** The underlying HTTP {@link Api}. */
        api,
        /** The underlying {@link Integration}. */
        integration,
        /** The auto-deployed {@link Stage}. */
        stage,
        /** The URL clients call. */
        url: stage.invokeUrl,
    };
}));
//# sourceMappingURL=HttpApi.js.map