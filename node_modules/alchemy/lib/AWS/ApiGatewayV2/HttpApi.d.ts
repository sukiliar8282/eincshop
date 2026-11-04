import * as agw2 from "@distilled.cloud/aws/apigatewayv2";
import type * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import type { Input } from "../../Input.ts";
import * as Output from "../../Output.ts";
import { Api } from "./Api.ts";
/**
 * The Lambda function an {@link HttpApi} fronts. Structural on purpose —
 * any resource exposing `functionArn`/`functionName` outputs (an
 * `AWS.Lambda.Function`) qualifies.
 */
export interface HttpApiHandler {
    /** The logical ID of the handler function. */
    readonly LogicalId: string;
    /** ARN of the Lambda function that serves requests. */
    readonly functionArn: Output.Output<string>;
    /** Name of the Lambda function that serves requests. */
    readonly functionName: Output.Output<string>;
}
export interface HttpApiProps {
    /**
     * The Lambda function that serves every request (`$default` route,
     * `AWS_PROXY` integration, payload format 2.0 — the same event shape as
     * Lambda Function URLs).
     */
    handler: HttpApiHandler;
    /**
     * Name of the API. If omitted, Alchemy generates a deterministic
     * physical name.
     */
    name?: Input<string>;
    /** Description of the API. */
    description?: Input<string>;
    /** CORS configuration. */
    cors?: Input<agw2.Cors>;
    /**
     * Disable the default `execute-api` endpoint (serve only via custom
     * domains).
     */
    disableExecuteApiEndpoint?: Input<boolean>;
    /**
     * The stage name to deploy. `$default` serves at the API root.
     * @default "$default"
     */
    stageName?: Input<string>;
    /**
     * Integration timeout (e.g. `"29 seconds"`; a bare number is
     * milliseconds, 50–30000). Sent to the API in whole milliseconds
     * (`TimeoutInMillis`).
     * @default 30 seconds
     */
    timeout?: Input<Duration.Input>;
    /** User-defined tags for the API and stage. */
    tags?: Record<string, string>;
}
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
export declare const HttpApi: (id: string, props: HttpApiProps) => Effect.Effect<{
    /** The underlying HTTP {@link Api}. */
    api: Api;
    /** The underlying {@link Integration}. */
    integration: import("./Integration.ts").IntegrationType;
    /** The auto-deployed {@link Stage}. */
    stage: import("./Stage.ts").ApiGatewayV2Stage;
    /** The URL clients call. */
    url: Output.Output<string, never>;
}, never, import("../Providers.ts").Providers>;
//# sourceMappingURL=HttpApi.d.ts.map