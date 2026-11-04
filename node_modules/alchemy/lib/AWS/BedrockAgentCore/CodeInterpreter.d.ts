import * as control from "@distilled.cloud/aws/bedrock-agentcore-control";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
export interface CodeInterpreterProps {
    /**
     * Name of the code interpreter. Must match `[a-zA-Z][a-zA-Z0-9_]{0,47}`
     * (underscores, no hyphens). If omitted, a deterministic physical name is
     * generated from the app, stage, and logical ID. Changing the name triggers
     * a replacement.
     */
    name?: string;
    /**
     * A description of the code interpreter. Changing it triggers a
     * replacement (the API has no update operation).
     */
    description?: string;
    /**
     * The ARN of an IAM role sessions assume to access AWS resources (e.g. S3
     * buckets) from executed code. Changing it triggers a replacement.
     */
    executionRoleArn?: string;
    /**
     * Network access for executed code: `SANDBOX` (no egress), `PUBLIC`
     * (internet egress), or `VPC`. Changing it triggers a replacement.
     * @default { networkMode: "SANDBOX" }
     */
    networkConfiguration?: control.CodeInterpreterNetworkConfiguration;
    /**
     * Tags to apply to the code interpreter. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface CodeInterpreter extends Resource<"AWS.BedrockAgentCore.CodeInterpreter", CodeInterpreterProps, {
    /**
     * The unique identifier of the code interpreter.
     */
    codeInterpreterId: string;
    /**
     * The ARN of the code interpreter.
     */
    codeInterpreterArn: string;
    /**
     * Name of the code interpreter.
     */
    name: string;
    /**
     * Current status of the code interpreter (e.g. `READY`).
     */
    status: string;
}> {
}
/**
 * A custom Amazon Bedrock AgentCore Code Interpreter — an isolated sandbox
 * where agents execute Python/JavaScript/TypeScript code.
 *
 * A custom interpreter controls the sandbox's network mode and execution
 * role. All configuration is create-only (the API has no update operation);
 * property changes trigger a replacement.
 *
 * ### Creating Code Interpreters
 * **Example:** Sandboxed Interpreter (no network egress)
 * ```typescript
 * import * as AgentCore from "alchemy/AWS/BedrockAgentCore";
 *
 * const interpreter = yield* AgentCore.CodeInterpreter("Sandbox", {});
 * ```
 *
 * **Example:** Interpreter with Public Egress
 * ```typescript
 * const interpreter = yield* AgentCore.CodeInterpreter("PublicSandbox", {
 *   networkConfiguration: { networkMode: "PUBLIC" },
 * });
 * ```
 *
 * ### Executing Code from a Function
 * **Example:** Start a Session and Run Code
 * ```typescript
 * // init
 * const startSession = yield* AgentCore.StartCodeInterpreterSession(interpreter);
 * const invoke = yield* AgentCore.InvokeCodeInterpreter(interpreter);
 * const stopSession = yield* AgentCore.StopCodeInterpreterSession(interpreter);
 *
 * return {
 *   fetch: Effect.gen(function* () {
 *     // runtime
 *     const session = yield* startSession({ sessionTimeout: "5 minutes" });
 *     const result = yield* invoke({
 *       sessionId: session.sessionId,
 *       name: "executeCode",
 *       arguments: { language: "python", code: "print(1 + 1)" },
 *     });
 *     const output = yield* Stream.runCollect(result.stream);
 *     yield* stopSession({ sessionId: session.sessionId });
 *     return HttpServerResponse.json({ output: Array.from(output) });
 *   }),
 * };
 * ```
 *
 * @resource
 */
export declare const CodeInterpreter: import("../../Resource.ts").ResourceClass<CodeInterpreter>;
export declare const CodeInterpreterProvider: () => import("effect/Layer").Layer<Provider.Provider<CodeInterpreter>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=CodeInterpreter.d.ts.map