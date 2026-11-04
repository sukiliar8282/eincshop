import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
import { findProviderByType } from "../../Provider.js";
import { stampedMode } from "../../ProviderMode.js";
import * as State from "../../State/index.js";
import { AlchemistInvalidInput } from "../Errors.js";
import { open } from "../Session.js";
/**
 * Open the stack and pair every deployed resource with the provider that
 * can speak for it. `entries` and `tail` differ only in which provider hook
 * they then call, so the selection lives here once.
 */
const select = Effect.fn(function* (input) {
    const session = yield* open(input.target);
    // The local store sits UNDER the session context, so the stack's own
    // store wins where it configures one: a project may only wire a remote
    // store at deploy time, and `alchemy logs` still has to resolve what was
    // deployed.
    const context = Context.merge(yield* Layer.build(State.localState()), session.context);
    const selected = new Set(input.resources ?? []);
    const available = [
        ...new Set(Object.values(session.stack.resources).map((resource) => resource.LogicalId)),
    ].sort();
    const unknown = [...selected].find((name) => !available.includes(name));
    if (unknown !== undefined) {
        return yield* Effect.fail(new AlchemistInvalidInput({
            field: "resources",
            message: `Unknown resource '${unknown}'. Available: ${available.join(", ") || "(none)"}`,
        }));
    }
    const rows = yield* Effect.provide(Effect.gen(function* () {
        const state = yield* yield* State.State;
        return yield* Effect.forEach(Object.entries(session.stack.resources), ([fqn, resource]) => Effect.gen(function* () {
            if (selected.size > 0 && !selected.has(resource.LogicalId)) {
                return [];
            }
            const stored = yield* state.get({
                stack: session.stack.name,
                stage: session.stack.stage,
                fqn,
            });
            if (!State.isResourceState(stored) || stored.attr === undefined) {
                return [];
            }
            return [
                {
                    resource: {
                        fqn,
                        logicalId: resource.LogicalId,
                        resourceType: resource.Type,
                    },
                    provider: yield* findProviderByType(resource.Type, stampedMode(stored)),
                    request: {
                        id: resource.LogicalId,
                        fqn,
                        instanceId: stored.instanceId,
                        props: stored.props,
                        output: stored.attr,
                    },
                },
            ];
        })).pipe(Effect.map((rows) => rows.flat()));
    }), context);
    return { context, rows };
});
/** Every deployed resource, with the log capabilities its provider offers. */
export const resources = Effect.fn("Alchemist.logs.resources")(function* (target) {
    const { rows } = yield* select({ target });
    return rows.map(({ resource, provider }) => ({
        ...resource,
        supportsQuery: provider.logs !== undefined,
        supportsTail: provider.tail !== undefined,
    }));
});
/** Query past log entries across the selected resources, oldest first. */
export const entries = Effect.fn("Alchemist.logs.entries")(function* (input) {
    const { context, rows } = yield* select(input);
    const entries = yield* Effect.provide(Effect.forEach(rows, ({ resource, provider, request }) => provider.logs === undefined
        ? Effect.succeed([])
        : provider
            .logs({
            ...request,
            options: {
                limit: input.limit ?? 100,
                since: input.since,
            },
        })
            .pipe(Effect.map((lines) => lines.map((line) => ({
            resource,
            timestamp: line.timestamp,
            message: line.message,
        }))))), context);
    return entries
        .flat()
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
});
/** Live-stream log entries from every selected resource that supports it. */
export const tail = (input) => Stream.unwrap(Effect.gen(function* () {
    const { context, rows } = yield* select(input);
    return Stream.mergeAll(rows.flatMap(({ resource, provider, request }) => provider.tail === undefined
        ? []
        : [
            Stream.provide(provider.tail(request), context).pipe(Stream.map((line) => ({
                resource,
                timestamp: line.timestamp,
                message: line.message,
            }))),
        ]), { concurrency: "unbounded" });
}));
//# sourceMappingURL=logs.js.map