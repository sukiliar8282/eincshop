import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
/**
 * A rule pointing an alias at a specific agent version (optionally with
 * provisioned throughput). Omit `routingConfiguration` entirely to have
 * Bedrock snapshot the current DRAFT into a new version and point the alias
 * at it — the common "deploy the current agent" case.
 */
export interface AgentAliasRoutingConfig {
    /** The agent version this alias routes invocations to. */
    agentVersion?: string;
    /** The ARN of a provisioned-throughput commitment to use. */
    provisionedThroughput?: string;
}
export interface AgentAliasProps {
    /**
     * The id of the {@link Agent} this alias belongs to. Accepts an agent's
     * `agentId` output. Changing the agent triggers a replacement.
     */
    agentId: string;
    /**
     * Name of the alias (1-100 characters; letters, digits, and the
     * characters `_-`). If omitted, a deterministic physical name is
     * generated from the app, stage, and logical ID. Changing the name
     * triggers a replacement.
     */
    agentAliasName?: string;
    /**
     * A description of the alias.
     */
    description?: string;
    /**
     * Which agent version(s) the alias routes to. When omitted, Bedrock
     * snapshots the current DRAFT into a new version and routes the alias to
     * it on create.
     */
    routingConfiguration?: AgentAliasRoutingConfig[];
    /**
     * Tags to apply to the alias. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface AgentAlias extends Resource<"AWS.Bedrock.AgentAlias", AgentAliasProps, {
    /**
     * The unique identifier of the agent the alias routes to.
     */
    agentId: string;
    /**
     * The unique identifier of the alias.
     */
    agentAliasId: string;
    /**
     * The ARN of the alias.
     */
    agentAliasArn: string;
    /**
     * Name of the alias.
     */
    agentAliasName: string;
}> {
}
/**
 * An alias for an Amazon Bedrock {@link Agent} — a stable, invocable pointer
 * to one or more agent versions.
 *
 * An alias is what applications invoke (via `bedrock-agent-runtime`
 * `InvokeAgent`). Creating an alias with no `routingConfiguration` snapshots
 * the agent's current DRAFT into a new immutable version and routes the alias
 * to it, so redeploying an updated + prepared agent and recreating the alias
 * publishes a new version.
 *
 * ### Creating Aliases
 * **Example:** Alias Pointing at the Current Agent
 * ```typescript
 * import * as Bedrock from "alchemy/AWS/Bedrock";
 *
 * const agent = yield* Bedrock.Agent("assistant", {
 *   foundationModel: "us.anthropic.claude-3-5-sonnet-20240620-v1:0",
 *   instruction: "You are a helpful assistant.",
 * });
 *
 * const alias = yield* Bedrock.AgentAlias("prod", {
 *   agentId: agent.agentId,
 * });
 * ```
 *
 * **Example:** Alias Pinned to a Specific Version
 * ```typescript
 * const alias = yield* Bedrock.AgentAlias("prod", {
 *   agentId: agent.agentId,
 *   routingConfiguration: [{ agentVersion: "3" }],
 * });
 * ```
 *
 * @resource
 */
export declare const AgentAlias: import("../../Resource.ts").ResourceClass<AgentAlias>;
export declare const AgentAliasProvider: () => import("effect/Layer").Layer<Provider.Provider<AgentAlias>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=AgentAlias.d.ts.map