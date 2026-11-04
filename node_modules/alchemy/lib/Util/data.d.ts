import * as Redacted from "effect/Redacted";
export type Primitive = never | undefined | null | boolean | number | string | bigint | symbol;
export declare const isPrimitive: (value: any) => value is Primitive;
export declare const isPlainObject: (value: unknown) => value is Record<string, unknown>;
/**
 * Is `value` plain data the engine's deep walkers may traverse — an array,
 * or an object whose prototype is `Object.prototype`/`null`?
 *
 * Everything else (class instances: effect's Effect/Layer/Context, Dates,
 * SDK config objects, functions, ...) is a LEAF for every deep walker in
 * the engine. The engine cannot meaningfully evaluate, diff, or persist
 * *through* a foreign class instance — rebuilding one entry-by-entry strips
 * its prototype — and walking one is not safe: effect ≥4.0.0-beta.103's
 * Context is self-referential (`cacheRoot` points back at itself), which
 * sent the naive walk-everything traversal into unbounded recursion
 * (#1082). Resources and Outputs are detected structurally *before* this
 * gate, so dependencies declared in plain props are unaffected.
 */
export declare const isPlainData: (value: unknown) => value is Record<string, unknown> | unknown[];
/**
 * Rebuild a plain-data value by mapping each child through `walk`,
 * preserving the shape (array → array, object → object).
 *
 * Cycle-guarded by ancestor path: a value that appears on its own ancestor
 * chain is a true cycle and becomes `undefined` (it could never serialize
 * or persist anyway). The guard is scoped to the current path — NOT a
 * visited-set — so a diamond (the same object legitimately referenced from
 * two places) is rebuilt in both places. Sync DFS only: add/delete around
 * the recursion is race-free. (#1082)
 */
export declare const mapPlainData: (value: Record<string, unknown> | unknown[], ancestors: WeakSet<object>, walk: (child: unknown) => unknown) => unknown;
export declare const stripFields: <T>(value: T, empty: null | undefined) => T;
export declare const stripNullFields: <T>(value: T) => T;
export declare const stripUndefinedFields: <T>(value: T) => T;
type UnwrapRedacted<T> = T extends Redacted.Redacted<infer U> ? U : T extends Record<string, any> ? {
    [K in keyof T]: UnwrapRedacted<T[K]>;
} : T extends Array<infer U> ? Array<UnwrapRedacted<U>> : T;
export declare const unwrapRedacted: <T>(value: T) => UnwrapRedacted<T>;
export {};
//# sourceMappingURL=data.d.ts.map