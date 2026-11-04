import * as control from "@distilled.cloud/aws/bedrock-agentcore-control";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
export interface GatewayProps {
    /**
     * Name of the gateway. Must match `([0-9a-zA-Z][-]?){1,100}` (hyphens
     * allowed, never consecutive). If omitted, a deterministic physical name is
     * generated from the app, stage, and logical ID. Changing the name triggers
     * a replacement.
     */
    name?: string;
    /**
     * A description of the gateway.
     */
    description?: string;
    /**
     * The ARN of an IAM role the gateway assumes to invoke its targets. Must
     * trust `bedrock-agentcore.amazonaws.com`.
     */
    roleArn: string;
    /**
     * The protocol the gateway speaks to callers.
     * @default "MCP"
     */
    protocolType?: control.GatewayProtocolType;
    /**
     * Protocol-specific configuration (MCP instructions, search, supported
     * versions). Passed through to the AgentCore API unchanged.
     */
    protocolConfiguration?: control.GatewayProtocolConfiguration;
    /**
     * How inbound callers are authorized. `AWS_IAM` uses SigV4; `CUSTOM_JWT`
     * requires `authorizerConfiguration`.
     * @default "AWS_IAM"
     */
    authorizerType?: control.AuthorizerType;
    /**
     * Authorizer configuration (JWT discovery URL, allowed audiences/clients).
     * Required when `authorizerType` is `CUSTOM_JWT`.
     */
    authorizerConfiguration?: control.AuthorizerConfiguration;
    /**
     * The ARN of a KMS key used to encrypt gateway data.
     */
    kmsKeyArn?: string;
    /**
     * Set to `DEBUG` to surface detailed exception traces to callers.
     */
    exceptionLevel?: control.ExceptionLevel;
    /**
     * Tags to apply to the gateway. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Gateway extends Resource<"AWS.BedrockAgentCore.Gateway", GatewayProps, {
    /**
     * The unique identifier of the gateway.
     */
    gatewayId: string;
    /**
     * The ARN of the gateway.
     */
    gatewayArn: string;
    /**
     * The MCP endpoint URL clients connect to (available once the gateway is
     * `READY`).
     */
    gatewayUrl: string | undefined;
    /**
     * Name of the gateway.
     */
    name: string;
    /**
     * Current status of the gateway (e.g. `READY`).
     */
    status: string;
}> {
}
/**
 * An Amazon Bedrock AgentCore Gateway — a managed MCP endpoint that turns
 * APIs and Lambda functions into agent-callable tools.
 *
 * A gateway fronts one or more targets (OpenAPI specs, Smithy models, Lambda
 * functions) behind a single MCP URL with centralized authorization (SigV4 or
 * JWT).
 *
 * ### Creating Gateways
 * **Example:** IAM-Authorized MCP Gateway
 * ```typescript
 * import * as AgentCore from "alchemy/AWS/BedrockAgentCore";
 * import * as IAM from "alchemy/AWS/IAM";
 *
 * const role = yield* IAM.Role("GatewayRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { Service: "bedrock-agentcore.amazonaws.com" },
 *         Action: ["sts:AssumeRole"],
 *       },
 *     ],
 *   },
 * });
 *
 * const gateway = yield* AgentCore.Gateway("ToolGateway", {
 *   roleArn: role.roleArn,
 *   authorizerType: "AWS_IAM",
 * });
 * ```
 *
 * **Example:** JWT-Authorized Gateway
 * ```typescript
 * const gateway = yield* AgentCore.Gateway("JwtGateway", {
 *   roleArn: role.roleArn,
 *   authorizerType: "CUSTOM_JWT",
 *   authorizerConfiguration: {
 *     customJWTAuthorizer: {
 *       discoveryUrl: `https://cognito-idp.us-west-2.amazonaws.com/${userPool.userPoolId}/.well-known/openid-configuration`,
 *       allowedClients: [client.clientId],
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Gateway: import("../../Resource.ts").ResourceClass<Gateway>;
export declare const GatewayProvider: () => import("effect/Layer").Layer<Provider.Provider<Gateway>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Gateway.d.ts.map