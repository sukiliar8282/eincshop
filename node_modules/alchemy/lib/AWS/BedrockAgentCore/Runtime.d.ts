import * as control from "@distilled.cloud/aws/bedrock-agentcore-control";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
/**
 * The deployable artifact of an agent runtime — a container image in ECR or
 * a managed-runtime code bundle in S3. Passed through to the AgentCore API
 * unchanged — see the AWS SDK `AgentRuntimeArtifact` shape.
 */
export type RuntimeArtifact = control.AgentRuntimeArtifact;
export interface RuntimeProps {
    /**
     * Name of the agent runtime. Must match `[a-zA-Z][a-zA-Z0-9_]{0,47}`
     * (underscores, no hyphens). If omitted, a deterministic physical name is
     * generated from the app, stage, and logical ID. Changing the name triggers
     * a replacement.
     */
    agentRuntimeName?: string;
    /**
     * A description of the agent runtime.
     */
    description?: string;
    /**
     * The deployable artifact: `{ containerConfiguration: { containerUri } }`
     * for an ECR image, or `{ codeConfiguration: ... }` for a managed-runtime
     * code bundle.
     */
    agentRuntimeArtifact: RuntimeArtifact;
    /**
     * The ARN of an IAM role the runtime assumes. Must trust
     * `bedrock-agentcore.amazonaws.com`.
     */
    roleArn: string;
    /**
     * Network access for the runtime.
     * @default { networkMode: "PUBLIC" }
     */
    networkConfiguration?: control.NetworkConfiguration;
    /**
     * The protocol the hosted agent serves (`HTTP`, `MCP`, or `A2A`).
     */
    protocolConfiguration?: control.ProtocolConfiguration;
    /**
     * Inbound authorization for `InvokeAgentRuntime` (JWT bearer tokens).
     * Omit for SigV4 (IAM).
     */
    authorizerConfiguration?: control.AuthorizerConfiguration;
    /**
     * Request headers forwarded to the agent container.
     */
    requestHeaderConfiguration?: control.RequestHeaderConfiguration;
    /**
     * Idle-session and max-lifetime configuration.
     */
    lifecycleConfiguration?: control.LifecycleConfiguration;
    /**
     * Environment variables injected into the agent container.
     */
    environmentVariables?: Record<string, string>;
    /**
     * Tags to apply to the runtime. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Runtime extends Resource<"AWS.BedrockAgentCore.Runtime", RuntimeProps, {
    /**
     * The unique identifier of the agent runtime.
     */
    agentRuntimeId: string;
    /**
     * The ARN of the agent runtime.
     */
    agentRuntimeArn: string;
    /**
     * The current version of the agent runtime (bumped on every update).
     */
    agentRuntimeVersion: string;
    /**
     * Name of the agent runtime.
     */
    agentRuntimeName: string;
    /**
     * Current status of the agent runtime (e.g. `READY`).
     */
    status: string;
}> {
}
/**
 * An Amazon Bedrock AgentCore Runtime — serverless hosting for containerized
 * AI agents.
 *
 * A runtime deploys an agent (an ECR container image or managed-runtime code
 * bundle) behind the `InvokeAgentRuntime` data-plane API with session
 * isolation, scaling, and identity built in. Each configuration change
 * publishes a new immutable runtime version.
 *
 * ### Creating Runtimes
 * **Example:** Container-Backed Agent Runtime
 * ```typescript
 * import * as AgentCore from "alchemy/AWS/BedrockAgentCore";
 *
 * const runtime = yield* AgentCore.Runtime("MyAgent", {
 *   agentRuntimeArtifact: {
 *     containerConfiguration: {
 *       containerUri: `${account}.dkr.ecr.us-west-2.amazonaws.com/my-agent:latest`,
 *     },
 *   },
 *   roleArn: role.roleArn,
 * });
 * ```
 *
 * ### Invoking from a Function
 * **Example:** Invoke the Agent
 * ```typescript
 * // init
 * const invoke = yield* AgentCore.InvokeAgentRuntime(runtime);
 *
 * return {
 *   fetch: Effect.gen(function* () {
 *     // runtime
 *     const response = yield* invoke({
 *       runtimeSessionId: "session-0000000000000000000000000000000001",
 *       payload: JSON.stringify({ prompt: "hello" }),
 *     });
 *     return HttpServerResponse.json({ contentType: response.contentType });
 *   }),
 * };
 * ```
 *
 * @resource
 */
export declare const Runtime: import("../../Resource.ts").ResourceClass<Runtime>;
export declare const RuntimeProvider: () => import("effect/Layer").Layer<Provider.Provider<Runtime>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Runtime.d.ts.map