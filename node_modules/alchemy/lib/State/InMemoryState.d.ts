import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type { ResourceState } from "./ResourceState.ts";
import { State } from "./State.ts";
type StackId = string;
type StageId = string;
type Fqn = string;
export declare const inMemoryState: (initialState?: Record<StackId, Record<StageId, Record<Fqn, ResourceState>>>, initialOutputs?: Record<StackId, Record<StageId, unknown>>) => Layer.Layer<State, never, never>;
export declare const InMemoryService: (state?: Record<StackId, Record<StageId, Record<Fqn, ResourceState>>>, outputs?: Record<StackId, Record<StageId, unknown>>) => Effect.Effect<import("./State.ts").StateService, never, never>;
export {};
//# sourceMappingURL=InMemoryState.d.ts.map