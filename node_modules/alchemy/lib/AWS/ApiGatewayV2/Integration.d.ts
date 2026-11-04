import * as agw2 from "@distilled.cloud/aws/apigatewayv2";
import type * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { Api } from "./Api.ts";
export interface IntegrationProps {
    /**
     * ID of the API this integration belongs to. Usually derived from
     * `api.apiId` by the {@link Integration} wrapper.
     */
    apiId: string;
    /**
     * The integration type. `AWS_PROXY` (Lambda proxy) is the common case
     * for both HTTP and WebSocket APIs; `HTTP_PROXY` forwards to an HTTP
     * endpoint; `MOCK` (WebSocket only) returns a static response.
     */
    integrationType: agw2.IntegrationType;
    /**
     * The integration endpoint:
     *
     * - `AWS_PROXY` on an HTTP API — the Lambda function ARN.
     * - `AWS_PROXY` on a WebSocket API — the full invocation URI
     *   (`arn:aws:apigateway:{region}:lambda:path/2015-03-31/functions/{functionArn}/invocations`).
     * - `HTTP_PROXY` — the HTTP URL.
     * - private integrations — the ELB listener / Cloud Map service ARN.
     */
    integrationUri?: string;
    /**
     * The HTTP method the integration uses when calling the backend
     * (`POST` for Lambda; for `HTTP_PROXY` routes usually `ANY`).
     */
    integrationMethod?: string;
    /**
     * The Lambda event payload format for HTTP API `AWS_PROXY` integrations.
     * `2.0` is the modern shape (same as Lambda Function URLs).
     * @default "2.0" for HTTP AWS_PROXY (AWS defaults to "1.0" — the wrapper does not override; set explicitly)
     */
    payloadFormatVersion?: string;
    /**
     * `INTERNET` (default) or `VPC_LINK` for private integrations.
     */
    connectionType?: agw2.ConnectionType;
    /**
     * The VPC link ID when `connectionType` is `VPC_LINK`.
     */
    connectionId?: string;
    /**
     * IAM credentials ARN for the integration (or
     * `arn:aws:iam::*:user/*` to use caller credentials).
     */
    credentialsArn?: string;
    /** Description of the integration. */
    description?: string;
    /**
     * AWS service integration subtype (e.g. `SQS-SendMessage`) for
     * first-class AWS service integrations on HTTP APIs.
     */
    integrationSubtype?: string;
    /** Passthrough behavior (WebSocket APIs only). */
    passthroughBehavior?: agw2.PassthroughBehavior;
    /** Request parameter mappings. */
    requestParameters?: {
        [key: string]: string | undefined;
    };
    /** Request templates (WebSocket APIs only). */
    requestTemplates?: {
        [key: string]: string | undefined;
    };
    /** Response parameter mappings (HTTP APIs). */
    responseParameters?: {
        [key: string]: {
            [key: string]: string | undefined;
        } | undefined;
    };
    /** Template selection expression (WebSocket APIs only). */
    templateSelectionExpression?: string;
    /**
     * Integration timeout (e.g. `"29 seconds"` or `Duration.seconds(29)`;
     * a bare number is milliseconds). 50–29000 ms for WebSocket APIs,
     * 50–30000 ms for HTTP APIs. Sent to the API in whole milliseconds
     * (`TimeoutInMillis`).
     */
    timeout?: Duration.Input;
    /** TLS configuration for private integrations. */
    tlsConfig?: agw2.TlsConfigInput;
    /** Content handling strategy (WebSocket APIs only). */
    contentHandlingStrategy?: agw2.ContentHandlingStrategy;
}
export interface IntegrationType extends Resource<"AWS.ApiGatewayV2.Integration", IntegrationProps, {
    /** The API this integration belongs to. */
    apiId: string;
    /** The integration identifier. */
    integrationId: string;
    integrationType: agw2.IntegrationType;
    integrationUri: string | undefined;
    integrationMethod: string | undefined;
    payloadFormatVersion: string | undefined;
    connectionType: agw2.ConnectionType | undefined;
    connectionId: string | undefined;
    credentialsArn: string | undefined;
    description: string | undefined;
    integrationSubtype: string | undefined;
    passthroughBehavior: agw2.PassthroughBehavior | undefined;
    requestParameters: {
        [key: string]: string | undefined;
    } | undefined;
    requestTemplates: {
        [key: string]: string | undefined;
    } | undefined;
    responseParameters: {
        [key: string]: {
            [key: string]: string | undefined;
        } | undefined;
    } | undefined;
    templateSelectionExpression: string | undefined;
    timeoutInMillis: number | undefined;
    contentHandlingStrategy: agw2.ContentHandlingStrategy | undefined;
}, never, Providers> {
}
/**
 * An API Gateway v2 Integration — the backend target a Route forwards to.
 *
 * For HTTP APIs the common integration is `AWS_PROXY` with payload format
 * `2.0`, pointing directly at a Lambda function ARN. For WebSocket APIs the
 * `integrationUri` must be the full Lambda invocation URI.
 * ### Lambda proxy integration (HTTP API)
 * **Example:** AWS_PROXY integration with payload 2.0
 * ```typescript
 * const integration = yield* ApiGatewayV2.Integration("Fn", {
 *   api,
 *   integrationType: "AWS_PROXY",
 *   integrationUri: fn.functionArn,
 *   payloadFormatVersion: "2.0",
 * });
 * ```
 *
 * ### HTTP proxy integration
 * **Example:** Forward to an external HTTP endpoint
 * ```typescript
 * const integration = yield* ApiGatewayV2.Integration("Upstream", {
 *   api,
 *   integrationType: "HTTP_PROXY",
 *   integrationUri: "https://example.com/{proxy}",
 *   integrationMethod: "ANY",
 *   payloadFormatVersion: "1.0",
 * });
 * ```
 *
 * @resource
 */
export declare const IntegrationResource: import("../../Resource.ts").ResourceClass<IntegrationType>;
export interface IntegrationInputProps extends Omit<{
    [K in keyof IntegrationProps]?: Input<IntegrationProps[K]>;
}, "apiId" | "integrationType"> {
    /**
     * The `Api` this integration belongs to (preferred). Alternatively pass
     * a raw `apiId`.
     */
    api?: Api;
    apiId?: Input<string>;
    integrationType: Input<agw2.IntegrationType>;
}
/**
 * User-facing wrapper for the Integration resource. Accepts `api: Api` as
 * the idiomatic way to attach an integration to an API.
 */
export declare const Integration: (id: string, props: IntegrationInputProps) => Effect.Effect<IntegrationType, never, Providers>;
export declare const IntegrationProvider: () => import("effect/Layer").Layer<Provider.Provider<IntegrationType>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Integration.d.ts.map