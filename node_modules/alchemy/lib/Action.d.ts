import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type { Pipeable } from "effect/Pipeable";
import type { Input } from "./Input.ts";
import { type NamespaceNode } from "./Namespace.ts";
import * as Output from "./Output.ts";
import { Stack } from "./Stack.ts";
/**
 * An Action is a node in the dependency graph that runs an Effect with its
 * resolved input during {@link plan}/{@link apply}. It is similar to a
 * Resource but without a Provider lifecycle:
 *
 *   - It has a LogicalId and typed Input.
 *   - The body Effect is called when input changes (diff) or `--force` is set.
 *   - There is no replace/precreate/read/delete: removing an Action from the
 *     stack simply drops its persisted state without invoking the body.
 *   - Dependencies pulled in by the init Effect surface as `Req` on the
 *     call site, exactly like a Resource's provider services.
 *
 * Actions are recorded on {@link Stack.actions} and produce a single output
 * value; `yield*` on the constructor returns `Output<Out>` for use as
 * input to downstream Resources / Actions.
 */
export interface ActionLike<Type extends string = string, In extends object | undefined = any, Out = any> {
    readonly Kind: "action";
    readonly Namespace: NamespaceNode | undefined;
    readonly FQN: string;
    readonly Type: Type;
    readonly LogicalId: string;
    readonly Input: In;
    /**
     * Resource Outputs referenced via `yield* output` inside the init Effect,
     * keyed by the Output's sanitized key. They become dependency edges (the
     * Action waits for these upstreams) and are resolved against the tracker at
     * apply time, then exposed to the body through the resolve
     * {@link RuntimeContext}. Empty when the Action captures nothing.
     */
    readonly Captures: Record<string, Output.Output>;
    /** Resolved runner — populated by the init effect (if any). */
    readonly Run: (input: In) => Effect.Effect<Out, any, any>;
    /** @internal phantom */
    Output: Out;
}
export declare const isAction: (value: any) => value is ActionLike;
/** Body function — runs each time the resolved input changes. */
export type ActionRunner<In extends object | undefined, Out, Req = any> = (input: In) => Effect.Effect<Out, any, Req>;
/**
 * Init Effect — declares dependencies via `yield*` and returns the runner.
 * Lets multiple Action definitions share resolved services.
 */
export type ActionInit<In extends object | undefined, Out, Req> = Effect.Effect<ActionRunner<In, Out, any>, any, Req>;
export declare function Action<Type extends string, In extends object | undefined, Out, Req = never>(type: Type, initOrRun: ActionRunner<In, Out, Req> | ActionInit<In, Out, Req>): ActionClass<never, Type, In, Out, Req>;
export declare function Action<Self, In extends object | undefined, Out>(): <Type extends string>(type: Type) => ActionClass<Self, Type, In, Out, Self>;
export interface ActionClass<Self, Type extends string, In extends object | undefined, Out, Req> {
    readonly Type: Type;
    /**
     * Default form — uses `Type` as the LogicalId. One instance per Action
     * definition (the common case for deploy-time work). Returns the Action's
     * output as `Output<Out>`.
     */
    (input: {
        [k in keyof In]: Input<In[k]>;
    }): Effect.Effect<Output.ToOutput<Out, never>, never, Req | Stack>;
    /**
     * Explicit-id form — register multiple instances of the same Action
     * definition under distinct logical ids.
     */
    (id: string, input: {
        [k in keyof In]: Input<In[k]>;
    }): Effect.Effect<Output.ToOutput<Out, never>, never, Req | Stack>;
    /**
     * Tagged-only: bind an init Effect to this Action's Self tag. Add the
     * returned Layer to the stack's `providers`.
     */
    make: [Self] extends [never] ? never : <R = never>(init: ActionRunner<In, Out, R> | ActionInit<In, Out, R>) => Layer.Layer<Self, never, R>;
    /** Tagged-only: the Context tag holding the resolved runner. */
    readonly Self: [Self] extends [never] ? never : Context.Service<Self, ActionRunner<In, Out, any>>;
}
/**
 * Pipeable Action instance used internally by Plan/Apply. Users get an
 * `Output<Out>` from `yield*` and don't normally see this.
 */
export type Action<Type extends string = string, In extends object | undefined = any, Out = any> = Pipeable & ActionLike<Type, In, Out>;
//# sourceMappingURL=Action.d.ts.map