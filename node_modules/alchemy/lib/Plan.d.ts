/** @effect-diagnostics anyUnknownInErrorContext:off */
/** @effect-diagnostics missingEffectError:off */
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import { type ActionLike } from "./Action.ts";
import { type ProviderService } from "./Provider.ts";
import { type ProviderMode } from "./ProviderMode.ts";
import { type PlannedAction, type PlannedResource } from "./Report.ts";
import { type ResourceBinding, type ResourceLike } from "./Resource.ts";
import { type StackSpec } from "./Stack.ts";
import { State, type ActionState, type CreatedResourceState, type CreatingResourceState, type RanActionState, type ReplacedResourceState, type ReplacingResourceState, type ResourceState, type UpdatedResourceState, type UpdatingReourceState } from "./State/index.ts";
export type PlanError = never;
/**
 * A node in the plan that represents a resource CRUD operation.
 */
export type CRUD<R extends ResourceLike = ResourceLike> = Create<R> | Update<R> | Delete<R> | Replace<R> | NoopUpdate<R>;
export type Apply<R extends ResourceLike = ResourceLike> = Create<R> | Update<R> | Replace<R> | NoopUpdate<R>;
export type BindingAction = "create" | "update" | "delete" | "noop";
export interface BindingNode<Data = any> extends ResourceBinding {
    action: BindingAction;
    data: Data;
}
export interface BaseNode<R extends ResourceLike<string> = ResourceLike<string>> {
    resource: R;
    provider: ProviderService<R>;
    /**
     * The {@link ProviderMode} this node's `provider` was resolved for.
     * `undefined` for mode-agnostic providers (a single implementation
     * serves both dev and deploy) — such resources never persist a mode and
     * never replace on a mode switch. Apply stamps this onto every state
     * commit as `providerMode`.
     */
    mode: ProviderMode | undefined;
    downstream: string[];
    bindings: BindingNode<R["Binding"]>[];
}
/**
 * Base for the apply-side nodes (create/update/replace/noop) — the nodes a
 * DECLARED resource plans to. Only these can carry a rename: a `Delete`
 * node is an orphaned row with no declaration, so nothing can claim to
 * have renamed it (migrating rows are excluded from the orphan pass
 * entirely).
 */
export interface ApplyNodeBase<R extends ResourceLike<string> = ResourceLike<string>> extends BaseNode<R> {
    /** Cloud attribute drift attached to synthetic drift-repair plans. */
    drift?: {
        readonly expected: unknown;
        readonly actual: unknown;
        readonly missing?: boolean;
    };
    /**
     * Set when this resource's persisted row was found under former FQNs
     * (`renamedFrom(...)`) — the migration source (no row at the current FQN
     * yet) and/or stale leftovers from interrupted migrations (same
     * `instanceId` as the resource's row; a rename chain with repeated
     * partial failures can leave several). Apply persists the move up-front,
     * before any lifecycle operation runs: commit `state` at the current
     * FQN, then delete every former row.
     */
    renamedFrom?: string[] | undefined;
}
export interface Create<R extends ResourceLike = ResourceLike> extends ApplyNodeBase<R> {
    action: "create";
    props: R["Props"];
    state: CreatingResourceState | undefined;
}
export interface Update<R extends ResourceLike = ResourceLike> extends ApplyNodeBase<R> {
    action: "update" | "adopted";
    /** True while this is the first reconcile after a cold adoption. */
    adopting?: boolean;
    props: R["Props"];
    state: CreatedResourceState | UpdatedResourceState | UpdatingReourceState | ReplacedResourceState;
}
export interface Delete<R extends ResourceLike = ResourceLike> extends BaseNode<R> {
    action: "delete" | "orphaned";
    state: ResourceState;
}
export interface NoopUpdate<R extends ResourceLike = ResourceLike> extends ApplyNodeBase<R> {
    action: "noop";
    state: CreatedResourceState | UpdatedResourceState;
}
export interface Replace<R extends ResourceLike = ResourceLike> extends ApplyNodeBase<R> {
    action: "replace";
    props: any;
    deleteFirst: boolean;
    restart?: boolean;
    state: CreatingResourceState | CreatedResourceState | UpdatingReourceState | UpdatedResourceState | ReplacingResourceState | ReplacedResourceState;
}
export type ActionApply<T extends ActionLike = ActionLike> = ActionRun<T> | ActionNoop<T>;
export interface ActionNodeBase<T extends ActionLike = ActionLike> {
    readonly kind: "action";
    def: T;
    downstream: string[];
}
export interface ActionRun<T extends ActionLike = ActionLike> extends ActionNodeBase<T> {
    action: "run";
    /** Input expression — resolved against tracker outputs during apply. */
    input: T["Input"];
    /** Previous state, if any. `undefined` on the first run. */
    state: ActionState | undefined;
    /** True when `--force` triggered the re-run regardless of input drift. */
    forced: boolean;
}
export interface ActionNoop<T extends ActionLike = ActionLike> extends ActionNodeBase<T> {
    action: "noop";
    state: RanActionState;
}
export interface ActionDelete<T extends ActionLike = ActionLike> extends ActionNodeBase<T> {
    action: "delete";
    state: ActionState;
}
export type Plan<Output = any> = {
    resources: {
        [id in string]: Apply<any>;
    };
    /**
     * Tasks scheduled for this apply. Keyed by FQN, same namespace as
     * `resources` — Apply's scheduler merges both into a single DAG.
     */
    actions: {
        [id in string]: ActionApply;
    };
    deletions: {
        [id in string]?: Delete<ResourceLike>;
    };
    /** Tasks whose state should be dropped (no body invoked on removal). */
    actionDeletions: {
        [id in string]?: ActionDelete;
    };
    output: Output;
    /**
     * FQNs of resources that participate in a strongly-connected component
     * of the upstream dependency graph (or have a self-edge). The scheduler
     * uses this to decide whether an `update` node must publish its prior
     * attr early to break the cycle, or can simply wait for upstreams and
     * publish a fresh attr (the common, linear case).
     */
    cycleMembers: ReadonlySet<string>;
    /**
     * The run-level default {@link ProviderMode} this plan was built with
     * (`alchemy dev` → `"local"`, `alchemy deploy` → `"live"`). Renderers use
     * it to tag only the EXCEPTIONS — rows whose resolved mode differs from
     * the run default. `undefined` (plans built by older/auxiliary builders)
     * is treated as `"live"`.
     */
    defaultMode?: ProviderMode;
    /**
     * Marks a plan built by {@link destroy}. `apply` finishes a destroy plan
     * by deleting the stage's remaining persisted state — notably the stack
     * output record written by the last deploy — instead of persisting a new
     * (empty) output.
     */
    destroy?: boolean;
};
/** The serializable row view of one resource node (see {@link describePlan}). */
export declare const describeResource: (node: CRUD) => PlannedResource;
/** The serializable row view of one stack-action node. */
export declare const describeAction: (node: ActionApply | ActionDelete) => PlannedAction;
/**
 * Serializable per-row views of a plan — everything a renderer or remote
 * consumer needs without holding the native plan: resource rows with their
 * bindings and provider modes, orphan deletions, and stack actions.
 */
export declare const describePlan: (plan: Plan) => {
    readonly resources: ReadonlyArray<PlannedResource>;
    readonly actions: ReadonlyArray<PlannedAction>;
};
export interface MakePlanOptions {
    force?: boolean;
}
export declare const make: <A>(stack: StackSpec<A>, options?: MakePlanOptions) => Effect.Effect<Plan<A>, never, State>;
/**
 * Build the plan that destroys every resource of `(stack.name, stack.stage)`.
 *
 * The spec is emptied out so every persisted resource becomes an orphan
 * deletion, and `output` is left undefined so `apply` does not overwrite the
 * last deploy's persisted stack output with an empty husk. `apply` recognizes
 * the `destroy` marker and deletes the stage's remaining persisted state (the
 * stack output record) once the destroy has converged, so `state.getOutput`
 * and `state.listStages` agree the stage is gone.
 *
 * @see https://github.com/alchemy-run/alchemy/issues/961
 */
export declare const destroy: (stack: {
    name: string;
    stage: string;
}) => Effect.Effect<Plan<undefined>, never, State>;
declare const DeleteResourceHasDownstreamDependencies_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => Cause.YieldableError & {
    readonly _tag: "DeleteResourceHasDownstreamDependencies";
} & Readonly<A>;
export declare class DeleteResourceHasDownstreamDependencies extends DeleteResourceHasDownstreamDependencies_base<{
    message: string;
    resourceId: string;
    dependencies: string[];
}> {
}
declare const UnsatisfiedResourceCycle_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => Cause.YieldableError & {
    readonly _tag: "UnsatisfiedResourceCycle";
} & Readonly<A>;
export declare class UnsatisfiedResourceCycle extends UnsatisfiedResourceCycle_base<{
    message: string;
    cycle: string[];
    missingPrecreate: string[];
}> {
}
/**
 * Print a plan in a human-readable format that shows the graph topology.
 */
export declare const printPlan: (plan: Plan) => string;
export {};
//# sourceMappingURL=Plan.d.ts.map