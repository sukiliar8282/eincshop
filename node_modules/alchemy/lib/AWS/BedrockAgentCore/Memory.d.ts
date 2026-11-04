import * as control from "@distilled.cloud/aws/bedrock-agentcore-control";
import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
/**
 * A single long-term memory extraction strategy (semantic, summary, user
 * preference, episodic, or custom). Passed through to the AgentCore API
 * unchanged — see the AWS SDK `MemoryStrategyInput` shape.
 */
export type MemoryStrategy = control.MemoryStrategyInput;
export interface MemoryProps {
    /**
     * Name of the memory. Must match `[a-zA-Z][a-zA-Z0-9_]{0,47}` (underscores,
     * no hyphens). If omitted, a deterministic physical name is generated from
     * the app, stage, and logical ID. Changing the name triggers a replacement.
     */
    name?: string;
    /**
     * A description of the memory.
     */
    description?: string;
    /**
     * How long until short-term memory events expire (7-365 days), e.g.
     * `"30 days"` or `Duration.days(30)` (a bare number is milliseconds).
     * @default 90 days
     */
    eventExpiryDuration?: Duration.Input;
    /**
     * The ARN of a KMS key used to encrypt the memory. Changing it triggers a
     * replacement.
     */
    encryptionKeyArn?: string;
    /**
     * The ARN of an IAM role AgentCore Memory assumes to run long-term
     * extraction strategies. Required when `memoryStrategies` use managed
     * extraction models.
     */
    memoryExecutionRoleArn?: string;
    /**
     * Long-term memory extraction strategies. Create-only: changing the
     * strategy list triggers a replacement (in-place strategy modification is
     * not reconciled).
     */
    memoryStrategies?: MemoryStrategy[];
    /**
     * Tags to apply to the memory. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Memory extends Resource<"AWS.BedrockAgentCore.Memory", MemoryProps, {
    /**
     * The unique identifier of the memory.
     */
    memoryId: string;
    /**
     * The ARN of the memory.
     */
    memoryArn: string;
    /**
     * Name of the memory.
     */
    name: string;
    /**
     * Current status of the memory (e.g. `ACTIVE`).
     */
    status: string;
}> {
}
/**
 * An Amazon Bedrock AgentCore Memory — managed short- and long-term memory
 * for AI agents.
 *
 * Short-term memory stores raw session events (turn-by-turn conversation);
 * optional `memoryStrategies` asynchronously extract long-term records
 * (semantic facts, summaries, user preferences) into queryable namespaces.
 *
 * Provisioning is asynchronous: the provider waits for the memory to reach
 * `ACTIVE` (~2-3 minutes) before returning.
 *
 * ### Creating Memories
 * **Example:** Short-Term Memory Only
 * ```typescript
 * import * as AgentCore from "alchemy/AWS/BedrockAgentCore";
 *
 * const memory = yield* AgentCore.Memory("SessionMemory", {
 *   eventExpiryDuration: "30 days",
 * });
 * ```
 *
 * **Example:** Memory with a Semantic Long-Term Strategy
 * ```typescript
 * const memory = yield* AgentCore.Memory("AgentMemory", {
 *   eventExpiryDuration: "90 days",
 *   memoryStrategies: [
 *     {
 *       semanticMemoryStrategy: {
 *         name: "facts",
 *         namespaces: ["facts/{actorId}"],
 *       },
 *     },
 *   ],
 * });
 * ```
 *
 * ### Using Memory from a Function
 * **Example:** Record and Query Events
 * ```typescript
 * // init
 * const createEvent = yield* AgentCore.CreateEvent(memory);
 * const listEvents = yield* AgentCore.ListEvents(memory);
 *
 * return {
 *   fetch: Effect.gen(function* () {
 *     // runtime
 *     yield* createEvent({
 *       actorId: "user-1",
 *       sessionId: "session-1",
 *       eventTimestamp: new Date(),
 *       payload: [
 *         {
 *           conversational: {
 *             role: "USER",
 *             content: { text: "My favorite color is teal." },
 *           },
 *         },
 *       ],
 *     });
 *     const events = yield* listEvents({
 *       actorId: "user-1",
 *       sessionId: "session-1",
 *     });
 *     return HttpServerResponse.json({ count: events.events.length });
 *   }),
 * };
 * ```
 *
 * @resource
 */
export declare const Memory: import("../../Resource.ts").ResourceClass<Memory>;
export declare const MemoryProvider: () => import("effect/Layer").Layer<Provider.Provider<Memory>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Memory.d.ts.map