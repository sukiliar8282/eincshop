import * as Effect from "effect/Effect";
import { State, type StateStoreError } from "./State.ts";
/** Reading or listing a path. Omit `path` for the root. */
export interface TreeQuery {
    readonly path?: string;
    /** Recurse into every descendant instead of stopping at immediate children. */
    readonly recursive?: boolean;
}
/** Deleting a path. The path is required — the root is not deletable. */
export interface TreeDelete {
    readonly path: string;
    /** Delete every descendant when the path identifies a directory. */
    readonly recursive?: boolean;
}
/** One decoded record produced by {@link readState}. */
export interface StateEntry {
    readonly path: string;
    readonly kind: "resource" | "output";
    readonly value: unknown;
}
declare const InvalidStatePath_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "InvalidStatePath";
} & Readonly<A>;
/** The path does not exist, or does not support the requested operation. */
export declare class InvalidStatePath extends InvalidStatePath_base<{
    readonly path: string;
    readonly reason: string;
}> {
}
export interface StateDeleted {
    readonly _tag: "StateDeleted";
    readonly path: string;
    readonly deleted: ReadonlyArray<string>;
}
/**
 * Every `(stack, stage)` pair the store holds, or the subset a filter pins.
 *
 * Enumerating them means `listStacks` then a `listStages` per stack, so the
 * fan-out runs concurrently: against a remote store a serial walk is one
 * round trip per stack before the first stage is even known. A pinned
 * `stack`/`stage` is taken at face value and skips the corresponding call —
 * naming a scope is not a claim that it exists, and callers report a missing
 * one from the emptiness of what comes back.
 *
 * Ordered by stack then stage so every traversal built on it is deterministic.
 */
export declare const allStages: (filter?: {
    readonly stack?: string;
    readonly stage?: string;
} | undefined) => Effect.Effect<readonly {
    readonly stack: string;
    readonly stage: string;
}[], StateStoreError, State>;
export declare const listState: (args_0: TreeQuery) => Effect.Effect<string[], InvalidStatePath | StateStoreError, State>;
export declare const readState: (args_0: TreeQuery) => Effect.Effect<StateEntry[], InvalidStatePath | StateStoreError, State>;
export declare const deleteState: (args_0: TreeDelete) => Effect.Effect<{
    _tag: "StateDeleted";
    path: string;
    deleted: string[];
}, InvalidStatePath | StateStoreError, State>;
export {};
//# sourceMappingURL=Tree.d.ts.map