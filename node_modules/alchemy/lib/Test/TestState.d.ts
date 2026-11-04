import * as Layer from "effect/Layer";
import { Stack } from "../Stack.ts";
import * as State from "../State/index.ts";
export declare const state: (resources?: Record<string, State.ResourceState>) => Layer.Layer<State.State, never, Stack>;
export declare const defaultState: (resources?: Record<string, State.ResourceState>, other?: {
    [stack: string]: {
        [stage: string]: {
            [resourceId: string]: State.ResourceState;
        };
    };
}) => Layer.Layer<State.State, never, never>;
//# sourceMappingURL=TestState.d.ts.map