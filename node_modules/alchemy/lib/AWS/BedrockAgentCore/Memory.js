import * as control from "@distilled.cloud/aws/bedrock-agentcore-control";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { toWireDays } from "../../Util/Duration.js";
import { AgentCoreProvisioningFailed, createAgentCoreName, readAgentCoreTags, retryWhileConflict, syncAgentCoreTags, unredact, } from "./internal.js";
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
export const Memory = Resource("AWS.BedrockAgentCore.Memory");
/** Statuses indicating an in-flight transition to wait out. */
const MEMORY_TRANSIENT = new Set(["CREATING", "UPDATING"]);
export const MemoryProvider = () => Provider.effect(Memory, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return props.name ?? (yield* createAgentCoreName(id));
    });
    const getMemoryOrUndefined = Effect.fn(function* (memoryId) {
        return yield* control.getMemory({ memoryId }).pipe(Effect.map((r) => r.memory), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    // Memory summaries carry no name, so find-by-name hydrates each
    // non-deleting summary and matches on the fetched name.
    const findByName = Effect.fn(function* (name) {
        const pages = yield* control.listMemories
            .pages({})
            .pipe(Stream.runCollect);
        const summaries = Array.from(pages).flatMap((page) => page.memories ?? []);
        const hydrated = yield* Effect.forEach(summaries, (s) => s.id === undefined || s.status === "DELETING"
            ? Effect.succeed(undefined)
            : getMemoryOrUndefined(s.id), { concurrency: 5 });
        return hydrated.find((m) => m !== undefined && m.name === name);
    });
    const waitForSettled = Effect.fn(function* (memoryId) {
        return yield* getMemoryOrUndefined(memoryId).pipe(Effect.repeat({
            schedule: Schedule.fixed("5 seconds"),
            until: (m) => m === undefined || !MEMORY_TRANSIENT.has(m.status),
            times: 60,
        }));
    });
    const toAttributes = (memory) => ({
        memoryId: memory.id,
        memoryArn: memory.arn,
        name: memory.name,
        status: memory.status,
    });
    return Memory.Provider.of({
        stables: ["memoryId", "memoryArn", "name"],
        list: () => Effect.gen(function* () {
            const pages = yield* control.listMemories
                .pages({})
                .pipe(Stream.runCollect);
            const summaries = Array.from(pages).flatMap((page) => page.memories ?? []);
            const hydrated = yield* Effect.forEach(summaries, (s) => s.id === undefined || s.status === "DELETING"
                ? Effect.succeed(undefined)
                : getMemoryOrUndefined(s.id), { concurrency: 5 });
            return hydrated.filter((m) => m !== undefined).map(toAttributes);
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const memory = output?.memoryId
                ? yield* getMemoryOrUndefined(output.memoryId)
                : yield* findByName(yield* createName(id, olds ?? {}));
            if (memory === undefined || memory.status === "DELETING") {
                return undefined;
            }
            const attrs = toAttributes(memory);
            const tags = yield* readAgentCoreTags(memory.arn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldProps = olds ?? {};
            const oldName = yield* createName(id, oldProps);
            const newName = yield* createName(id, news ?? {});
            if (oldName !== newName) {
                return { action: "replace" };
            }
            if ((oldProps.encryptionKeyArn ?? undefined) !==
                (news?.encryptionKeyArn ?? undefined)) {
                return { action: "replace" };
            }
            // Strategy lists are create-only: in-place strategy mutation uses a
            // different (Modify) input shape and partial updates — replace.
            if (JSON.stringify(oldProps.memoryStrategies ?? []) !==
                JSON.stringify(news?.memoryStrategies ?? [])) {
                return { action: "replace" };
            }
            // description / eventExpiryDuration / execution role / tags converge
            // via update.
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const props = news ?? {};
            const name = output?.name ?? (yield* createName(id, props));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...props.tags, ...internalTags };
            const eventExpiryDuration = toWireDays(props.eventExpiryDuration) ?? 90;
            // 1. OBSERVE — cloud state is authoritative; output is an id cache.
            let memory = output?.memoryId
                ? yield* getMemoryOrUndefined(output.memoryId)
                : undefined;
            if (memory === undefined) {
                memory = yield* findByName(name);
            }
            // 2. ENSURE — create if missing; tolerate the name-exists race.
            if (memory === undefined) {
                const created = yield* control
                    .createMemory({
                    name,
                    description: props.description,
                    eventExpiryDuration,
                    encryptionKeyArn: props.encryptionKeyArn,
                    memoryExecutionRoleArn: props.memoryExecutionRoleArn,
                    memoryStrategies: props.memoryStrategies,
                    tags: desiredTags,
                })
                    .pipe(Effect.map((r) => r.memory), Effect.catchTag("ConflictException", () => findByName(name)));
                memory = created ?? (yield* findByName(name));
            }
            if (memory === undefined) {
                return yield* new AgentCoreProvisioningFailed({
                    message: `memory '${name}' was neither created nor found`,
                });
            }
            // Wait out CREATING/UPDATING (~2-3 minutes on create).
            memory = (yield* waitForSettled(memory.id)) ?? memory;
            if (memory.status === "FAILED") {
                return yield* new AgentCoreProvisioningFailed({
                    message: `memory '${name}' failed: ${memory.failureReason ?? "unknown"}`,
                });
            }
            // 3. SYNC — converge mutable settings from OBSERVED state.
            const drifted = (unredact(memory.description) ?? undefined) !==
                (props.description ?? unredact(memory.description)) ||
                memory.eventExpiryDuration !== eventExpiryDuration ||
                (memory.memoryExecutionRoleArn ?? undefined) !==
                    (props.memoryExecutionRoleArn ?? memory.memoryExecutionRoleArn);
            if (drifted) {
                yield* control.updateMemory({
                    memoryId: memory.id,
                    description: props.description,
                    eventExpiryDuration,
                    memoryExecutionRoleArn: props.memoryExecutionRoleArn,
                });
                memory = (yield* waitForSettled(memory.id)) ?? memory;
            }
            // 3b. SYNC TAGS against observed cloud tags.
            yield* syncAgentCoreTags(memory.arn, desiredTags);
            // 4. RETURN fresh attributes.
            yield* session.note(memory.id);
            return toAttributes(memory);
        }),
        // Deletion is initiated with deleteMemory and completes server-side in
        // ~30s. Wait until fully gone so an immediate re-create of the same
        // name cannot hit the lingering DELETING record.
        delete: Effect.fn(function* ({ output }) {
            yield* control.deleteMemory({ memoryId: output.memoryId }).pipe(retryWhileConflict, Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            yield* control.getMemory({ memoryId: output.memoryId }).pipe(Effect.map((r) => r.memory.status), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed("GONE")), Effect.repeat({
                schedule: Schedule.fixed("5 seconds"),
                until: (status) => status === "GONE",
                times: 36,
            }));
        }),
    });
}));
//# sourceMappingURL=Memory.js.map