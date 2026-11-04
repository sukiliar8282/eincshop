import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { recordStateStoreInit } from "../Telemetry/Metrics.js";
import { STATE_STORE_VERSION } from "./HttpStateApi.js";
import { State } from "./State.js";
export const inMemoryState = (initialState = {}, initialOutputs = {}) => Layer.effect(State, Effect.cached(InMemoryService(initialState, initialOutputs).pipe(recordStateStoreInit)));
export const InMemoryService = (state = {}, outputs = {}) => State.of(Effect.succeed({
    id: "inmemory",
    getVersion: () => Effect.succeed(STATE_STORE_VERSION),
    listStacks: () => Effect.succeed(Array.from(Object.keys(state))),
    listStages: (stack) => Effect.succeed(Array.from(stack in state ? Object.keys(state[stack]) : [])),
    get: ({ stack, stage, fqn, }) => Effect.succeed(state[stack]?.[stage]?.[fqn]),
    getReplacedResources: ({ stack, stage, }) => Effect.succeed(Array.from(Object.values(state[stack]?.[stage] ?? {}) ?? []).filter((s) => s.status === "replaced")),
    set: ({ stack, stage, fqn, value, }) => Effect.sync(() => {
        const stackState = (state[stack] ??= {});
        const stageState = (stackState[stage] ??= {});
        stageState[fqn] = value;
        return value;
    }),
    delete: ({ stack, stage, fqn, }) => Effect.sync(() => delete state[stack]?.[stage]?.[fqn]),
    deleteStack: ({ stack, stage }) => Effect.sync(() => {
        if (stage === undefined) {
            delete state[stack];
            delete outputs[stack];
        }
        else {
            delete state[stack]?.[stage];
            delete outputs[stack]?.[stage];
        }
    }),
    list: ({ stack, stage }) => Effect.succeed(Array.from(Object.keys(state[stack]?.[stage] ?? {}) ?? [])),
    getOutput: ({ stack, stage }) => Effect.succeed(outputs[stack]?.[stage]),
    setOutput: ({ stack, stage, value, }) => Effect.sync(() => {
        const stackOutputs = (outputs[stack] ??= {});
        stackOutputs[stage] = value;
        return value;
    }),
}));
//# sourceMappingURL=InMemoryState.js.map