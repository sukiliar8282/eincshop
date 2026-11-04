import * as bedrock from "@distilled.cloud/aws/bedrock-agent";
import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
/**
 * A guardrail attached to an agent to apply content filters, denied topics,
 * word filters, and sensitive-information policies to model interactions.
 */
export interface AgentGuardrailConfiguration {
    /** The unique identifier of the guardrail. */
    guardrailIdentifier?: string;
    /** The version of the guardrail. */
    guardrailVersion?: string;
}
/**
 * Long-term memory configuration for an agent — lets the agent retain
 * conversational context across sessions as asynchronously generated
 * session summaries, readable at runtime via the `GetAgentMemory` binding.
 */
export interface AgentMemoryConfiguration {
    /**
     * The types of memory to enable. `"SESSION_SUMMARY"` is currently the
     * only supported type.
     */
    enabledMemoryTypes: bedrock.MemoryType[];
    /**
     * How long the agent retains memory (e.g. `"30 days"` or
     * `Duration.days(30)`; a bare number is milliseconds). Between 1 and
     * 365 days. Sent to the API as whole days (`storageDays`).
     * @default 30 days
     */
    storage?: Duration.Input;
    /**
     * Configuration for `SESSION_SUMMARY` memory.
     */
    sessionSummaryConfiguration?: {
        /** The maximum number of recent session summaries to include. */
        maxRecentSessions?: number;
    };
}
export interface AgentProps {
    /**
     * Name of the agent (1-100 characters; letters, digits, and the
     * characters `_-`). If omitted, a deterministic physical name is
     * generated from the app, stage, and logical ID. Changing the name
     * triggers a replacement.
     */
    agentName?: string;
    /**
     * The foundation model or inference-profile id the agent uses for
     * orchestration — a foundation-model id
     * (`anthropic.claude-3-5-sonnet-20240620-v1:0`), a cross-region inference
     * profile id (`us.anthropic.claude-3-5-sonnet-20240620-v1:0`), or a full
     * Bedrock ARN. Model access must be enabled in the account.
     */
    foundationModel: string;
    /**
     * Instructions that tell the agent what it should do and how it should
     * interact with users. Must be at least 40 characters for the agent to be
     * preparable.
     */
    instruction: string;
    /**
     * A description of the agent.
     */
    description?: string;
    /**
     * The ARN of an existing IAM role for the agent to assume. When omitted,
     * an execution role is created automatically with `bedrock.amazonaws.com`
     * trust and `bedrock:InvokeModel` granted on {@link AgentProps.foundationModel}.
     */
    agentResourceRoleArn?: string;
    /**
     * How long the agent retains an idle session before it is ended (e.g.
     * `"30 minutes"` or `Duration.minutes(30)`; a bare number is milliseconds).
     * Between 1 minute and 1 hour. Sent to the API as whole seconds
     * (`idleSessionTTLInSeconds`).
     * @default 600 seconds
     */
    idleSessionTTL?: Duration.Input;
    /**
     * The ARN of a KMS key to encrypt the agent with.
     */
    customerEncryptionKeyArn?: string;
    /**
     * A guardrail to apply to the agent's model interactions.
     */
    guardrailConfiguration?: AgentGuardrailConfiguration;
    /**
     * Long-term memory configuration. When enabled the agent summarizes each
     * session after it ends and retains the summaries for
     * {@link AgentMemoryConfiguration.storage}, making them available to
     * later sessions that share the same memory id (and to the
     * `GetAgentMemory` / `DeleteAgentMemory` runtime bindings).
     */
    memoryConfiguration?: AgentMemoryConfiguration;
    /**
     * Whether to prepare the agent (compile the DRAFT version) after every
     * create and update so it is invocable and can back an
     * {@link AgentAlias}. Preparation is polled to completion.
     * @default true
     */
    prepare?: boolean;
    /**
     * Tags to apply to the agent. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Agent extends Resource<"AWS.Bedrock.Agent", AgentProps, {
    /**
     * The unique identifier of the agent.
     */
    agentId: string;
    /**
     * The ARN of the agent.
     */
    agentArn: string;
    /**
     * Name of the agent.
     */
    agentName: string;
    /** The DRAFT version identifier (always `"DRAFT"`). */
    agentVersion: string;
    /** The ARN of the role the agent assumes. */
    agentResourceRoleArn: string;
    /**
     * Name of the auto-created execution role. `undefined` when an explicit
     * {@link AgentProps.agentResourceRoleArn} is used.
     */
    roleName: string | undefined;
}> {
}
/**
 * An Amazon Bedrock agent — a foundation model driven by natural-language
 * instructions that can orchestrate multi-step tasks.
 *
 * `Agent` owns the lifecycle of the agent's DRAFT version. An IAM execution
 * role is created automatically (trusted by `bedrock.amazonaws.com`, granted
 * `bedrock:InvokeModel` on the foundation model) unless an explicit
 * `agentResourceRoleArn` is supplied. After every create/update the agent is
 * prepared (unless `prepare: false`) so it is immediately invocable and can
 * back an {@link AgentAlias}.
 *
 * ### Creating Agents
 * **Example:** Minimal Agent
 * ```typescript
 * import * as Bedrock from "alchemy/AWS/Bedrock";
 *
 * const agent = yield* Bedrock.Agent("assistant", {
 *   foundationModel: "us.anthropic.claude-3-5-sonnet-20240620-v1:0",
 *   instruction:
 *     "You are a helpful assistant that answers questions concisely.",
 * });
 * ```
 *
 * **Example:** Agent with a Guardrail and Custom Session TTL
 * ```typescript
 * const agent = yield* Bedrock.Agent("assistant", {
 *   foundationModel: "us.anthropic.claude-3-5-sonnet-20240620-v1:0",
 *   instruction: "You are a careful, policy-compliant support agent.",
 *   idleSessionTTL: "30 minutes",
 *   guardrailConfiguration: {
 *     guardrailIdentifier: guardrail.guardrailId,
 *     guardrailVersion: "DRAFT",
 *   },
 * });
 * ```
 *
 * **Example:** Agent with Long-Term Memory
 * ```typescript
 * // Session summaries are retained for 30 days and readable at runtime
 * // through the GetAgentMemory binding.
 * const agent = yield* Bedrock.Agent("assistant", {
 *   foundationModel: "us.anthropic.claude-3-5-sonnet-20240620-v1:0",
 *   instruction: "You are a helpful assistant that remembers past sessions.",
 *   memoryConfiguration: {
 *     enabledMemoryTypes: ["SESSION_SUMMARY"],
 *     storage: "30 days",
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Agent: import("../../Resource.ts").ResourceClass<Agent>;
export declare const AgentProvider: () => import("effect/Layer").Layer<Provider.Provider<Agent>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Agent.d.ts.map