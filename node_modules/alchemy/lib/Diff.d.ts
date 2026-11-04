import type { Input } from "./Input.ts";
import type { BindingNode } from "./Plan.ts";
import type { ResourceBinding } from "./Resource.ts";
export type Diff = NoopDiff | UpdateDiff | ReplaceDiff;
export interface NoopDiff {
    action: "noop";
    stables?: undefined;
}
export interface UpdateDiff {
    action: "update";
    /** properties that won't change as part of this update */
    stables?: string[];
}
export interface ReplaceDiff {
    action: "replace";
    deleteFirst?: boolean;
    stables?: undefined;
}
/**
 * Returns true when `value` (or any nested leaf) is still an unresolved
 * plan-time expression — i.e. an `Output`/`Expr` or an `Effect` that was
 * not fully evaluated by `resolveInput` in Plan.ts.
 *
 * Use at the top of a provider `diff` to short-circuit before field access:
 *
 * ```ts
 * if (!isResolved(news)) return undefined;
 * const resolved = news as MyProps;
 * ```
 */
export declare const hasUnresolvedInputs: <T>(value: Input<NoInfer<T>>) => value is T;
export declare const isResolved: <T>(value: Input<T>) => value is T;
/**
 * Deeply replace every unresolved plan-time expression (an `Output`/`Expr`
 * or an un-evaluated `Effect`) with `undefined`, leaving resolved values
 * (including opaque `Redacted`/`Duration` instances) intact.
 *
 * Persisted resource state must only ever hold plain data. Durable (JSON)
 * state stores already enforce this implicitly — Output proxies are
 * function-typed, so `JSON.stringify` silently drops them — but the
 * in-memory store used by tests retains live proxies, which would later be
 * fed back into provider lifecycle operations as `olds` after an
 * interrupted apply (e.g. `read` during a destroy plan) and blow up on
 * first string coercion. Sanitizing at the commit boundary keeps both
 * store kinds consistent with the provider contract that `olds` is
 * resolved `Props`.
 */
export declare const stripUnresolved: <T>(value: T) => T;
/**
 * Deeply replace Effect-valued entries with `undefined`, leaving resolved
 * values AND unresolved `Output`/`Expr`s intact.
 *
 * Effect-valued props — e.g. a tagged Worker class in `env` (the
 * circular-bindings pattern) — can never be evaluated inside lifecycle
 * operations, and {@link stripUnresolved} drops them from persisted state at
 * the commit boundary. A provider `diff` that wants its structural change
 * detection to still run despite them strips them first, so `isResolved`
 * gates only on genuinely-unresolved Outputs (#874). The Effects' deploy-time
 * identity is carried by the resolved binding data instead.
 */
export declare const stripEffects: <T>(value: T) => T;
export declare const somePropsAreDifferent: <Props extends Record<string, any>>(olds: Props, news: Props, props: (keyof Props)[]) => boolean;
export declare const anyPropsAreDifferent: <Props extends Record<string, any>>(olds: Props, news: Props) => boolean;
export declare const havePropsChanged: <Props extends object>(oldProps: Props | undefined, newProps: Props) => boolean;
export type DeepEqualOptions = {
    /**
     * When true, treat `null` and `undefined` as equivalent at any depth.
     * Useful when comparing cloud-API responses (which often return `null`
     * for unconfigured optional fields) against desired-state shapes built
     * from `props?.x` (which leave the same fields `undefined`).
     *
     * @default false
     */
    stripNullish?: boolean;
};
/**
 * Sort-keys deep equality for plain data (objects, arrays, primitives).
 * Use in provider `diff` handlers instead of ad-hoc `JSON.stringify` comparisons.
 *
 * By default, `null` and `undefined` are treated as distinct. Pass
 * `{ stripNullish: true }` to opt into treating them as equivalent.
 */
export declare const deepEqual: (a: unknown, b: unknown, options?: DeepEqualOptions) => boolean;
export declare const sortBindings: <B extends {
    sid: string;
}>(bindings: B[]) => B[];
/**
 * Collapse bindings that share the same `sid`, keeping the last occurrence,
 * and return them in deterministic (sid-sorted) order.
 *
 * The same binding can be recorded more than once on a target resource — e.g.
 * a KV namespace bound to both a Worker and a Workflow ends up pushed twice to
 * `stack.bindings[fqn]`. `diffBindings` already collapses these implicitly via
 * its `Map` keyed by `sid`, so the `reconcile` path never observes duplicates.
 * Use this helper to give a provider's `diff` handler the same de-duplicated
 * binding set, keeping plan-time hashing consistent with deploy-time.
 */
export declare const dedupeBindings: <B extends ResourceBinding>(bindings: B[]) => B[];
export declare const diffBindings: (oldBindings: ResourceBinding[], newBindings: ResourceBinding[]) => BindingNode[];
//# sourceMappingURL=Diff.d.ts.map