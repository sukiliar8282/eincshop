import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Path from "effect/Path";
import { State, type StateService } from "./State.ts";
export declare const localState: () => Layer.Layer<State, never, FileSystem.FileSystem | Path.Path>;
export declare const makeLocalState: () => Effect.Effect<StateService, never, FileSystem.FileSystem | Path.Path>;
//# sourceMappingURL=LocalState.d.ts.map