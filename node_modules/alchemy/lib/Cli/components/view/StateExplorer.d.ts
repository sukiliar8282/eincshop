import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import type { InvalidStatePath, StateStoreError } from "../../../State/index.ts";
import { Screen } from "../../CliKit/index.ts";
export type StateFileRef = {
    readonly kind: "resource";
    readonly stack: string;
    readonly stage: string;
    readonly fqn: string;
} | {
    readonly kind: "output";
    readonly stack: string;
    readonly stage: string;
};
export type StateExplorerError = InvalidStatePath | StateStoreError;
export interface StateExplorerSource {
    readonly backend: string;
    readonly listStacks: Effect.Effect<ReadonlyArray<string>, StateExplorerError>;
    readonly listStages: (stack: string) => Effect.Effect<ReadonlyArray<string>, StateExplorerError>;
    readonly listResources: (stack: string, stage: string) => Effect.Effect<ReadonlyArray<string>, StateExplorerError>;
    readonly readFile: (file: StateFileRef) => Effect.Effect<unknown, StateExplorerError>;
    readonly deleteNodes: (nodes: ReadonlyArray<StateBrowserNode>) => Effect.Effect<void, StateExplorerError>;
}
export type StateBrowserNode = {
    readonly kind: "stack";
    readonly id: string;
    readonly name: string;
    readonly path: string;
    readonly stack: string;
} | {
    readonly kind: "stage";
    readonly id: string;
    readonly name: string;
    readonly path: string;
    readonly stack: string;
    readonly stage: string;
} | {
    readonly kind: "namespace";
    readonly id: string;
    readonly name: string;
    readonly path: string;
    readonly stack: string;
    readonly stage: string;
    readonly children: ReadonlyArray<StateBrowserNode>;
} | {
    readonly kind: "resource";
    readonly id: string;
    readonly name: string;
    readonly path: string;
    readonly file: StateFileRef & {
        readonly kind: "resource";
    };
} | {
    readonly kind: "output";
    readonly id: string;
    readonly name: string;
    readonly path: string;
    readonly file: StateFileRef & {
        readonly kind: "output";
    };
};
type LoadState<Value> = {
    readonly status: "idle";
} | {
    readonly status: "loading";
} | {
    readonly status: "ready";
    readonly value: Value;
} | {
    readonly status: "error";
    readonly message: string;
};
interface ExplorerSnapshot {
    readonly root: LoadState<ReadonlyArray<StateBrowserNode>>;
    readonly children: ReadonlyMap<string, LoadState<ReadonlyArray<StateBrowserNode>>>;
    readonly files: ReadonlyMap<string, LoadState<unknown>>;
}
/** Mutable async cache: every state-store read is initiated by a selection. */
export declare class StateExplorerStore {
    readonly source: StateExplorerSource;
    private readonly services;
    private state;
    private readonly listeners;
    private readonly fibers;
    constructor(source: StateExplorerSource, services?: Context.Context<never>);
    readonly subscribe: (listener: () => void) => () => boolean;
    readonly snapshot: () => ExplorerSnapshot;
    private commit;
    /**
     * Fork the effect in the CLI's ambient services and hand its exit to the
     * caller. A fiber the store no longer tracks — dropped by `refresh` or
     * `dispose` — is stale, and its result is discarded even if it managed to
     * complete before the interrupt landed.
     */
    private run;
    private interruptAll;
    readonly loadRoot: () => void;
    readonly refresh: () => void;
    /**
     * Re-list only what a deletion could have changed — the parent listing of
     * each target — and drop cached files under it. Every other cached column
     * survives, so the explorer keeps its position instead of collapsing to
     * the stack list the way `refresh` does.
     */
    readonly invalidate: (targets: ReadonlyArray<StateBrowserNode>) => void;
    readonly loadChildren: (node: StateBrowserNode) => void;
    readonly loadFile: (node: StateBrowserNode) => void;
    readonly deleteNodes: (targets: ReadonlyArray<StateBrowserNode>, handlers: {
        readonly onSuccess: () => void;
        readonly onFailure: (message: string) => void;
    }) => void;
    readonly dispose: () => void;
}
/** Convert listed FQNs to namespace columns without reading any state values. */
export declare const buildStageNodes: (stack: string, stage: string, fqns: ReadonlyArray<string>) => ReadonlyArray<StateBrowserNode>;
export declare const stateExplorerScreen: (source: StateExplorerSource, services?: Context.Context<never>) => Screen<void>;
export {};
//# sourceMappingURL=StateExplorer.d.ts.map