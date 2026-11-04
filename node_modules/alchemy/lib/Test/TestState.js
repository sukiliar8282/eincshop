import * as Layer from "effect/Layer";
import { Stack } from "../Stack.js";
import * as State from "../State/index.js";
export const state = (resources = {}) => Layer.effect(State.State, Stack.useSync((stack) => State.InMemoryService({
    [stack.name]: {
        [stack.stage]: resources,
    },
})));
export const defaultState = (resources = {}, other) => Layer.succeed(State.State, State.InMemoryService({
    ["test-app"]: {
        ["test-stage"]: resources,
    },
    ...other,
}));
//# sourceMappingURL=TestState.js.map