import * as Effect from "effect/Effect";
import type { Pipeable } from "effect/Pipeable";
import type { Input, InputProps, PropsInput } from "./Input.ts";
import { type NamespaceNode } from "./Namespace.ts";
import * as Output from "./Output.ts";
import { Provider } from "./Provider.ts";
import { type ProviderMode } from "./ProviderMode.ts";
import { RemovalPolicy } from "./RemovalPolicy.ts";
import { Self } from "./Self.ts";
export type ResourceConstructor<R extends ResourceLike, Req = never> = {
    Type: R["Type"];
    Props: R["Props"];
    <const Methods extends {
        [key: string]: any;
    }>(methods: Methods): ResourceClassWithMethods<R, Methods>;
    (id: string, ...args: {} extends R["Props"] ? [props?: PropsInput<R["Props"]>] : [props: PropsInput<R["Props"]>]): Effect.Effect<R, never, Req>;
    <PropsReq = never>(id: string, props: Effect.Effect<InputProps<R["Props"]>, never, PropsReq>): Effect.Effect<R, never, PropsReq | Req>;
};
export interface ResourceClassLike<R extends ResourceLike> {
    Type: R["Type"];
    Props: R["Props"];
    Self: Self<R>;
    Provider: Provider<R>;
    /**
     * Legacy type names this resource was previously registered under
     * (see {@link ResourceOptions.aliases}). Copied onto the
     * `ProviderService` by `Provider.succeed`/`Provider.effect` so provider
     * lookup can resolve state persisted under a pre-rename type.
     *
     * `undefined` is accepted explicitly so `ResourceClass` (whose `Aliases`
     * is `readonly string[] | undefined`) stays assignable to
     * `ResourceClassLike` under `exactOptionalPropertyTypes`.
     */
    Aliases?: readonly string[] | undefined;
}
export type ResourceClass<R extends ResourceLike> = ResourceConstructor<R, R["Providers"] extends undefined ? Provider<R> : R["Providers"]> & Effect.Effect<ResourceConstructor<R>> & {
    Self: Self<R>;
    Provider: Provider<R>;
    Aliases: readonly string[] | undefined;
    ref(id: string, options?: {
        stage?: string;
        stack?: string;
    }): Effect.Effect<R>;
};
export type ResourceClassWithMethods<R extends ResourceLike, Methods extends {
    [key: string]: any;
}> = ResourceConstructor<R, R["Providers"] extends undefined ? Provider<R> : R["Providers"]> & Effect.Effect<ResourceConstructor<R>> & {
    Self: Self<R>;
    Provider: Provider<R>;
    Aliases: readonly string[] | undefined;
    ref(id: string, options?: {
        stage?: string;
        stack?: string;
    }): Effect.Effect<R>;
} & Methods;
export type LogicalId = string;
export interface ResourceBinding<Data = any> {
    sid: string;
    data: Data;
}
export interface ResourceLike<Type extends string = string, Props extends object | undefined = any, Attributes extends object = object, Binding = any, Providers = any> {
    /**
     * Namespace containing this Resource.
     */
    Namespace: NamespaceNode | undefined;
    /**
     * Fully Qualified Name (namespace path + logical ID).
     * Used as the unique key for state storage.
     */
    FQN: string;
    /**
     * Type of the Resource (e.g. AWS.Lambda.Function)
     */
    Type: Type;
    /**
     * Logical ID of the Resource (e.g. MyFunction)
     */
    LogicalId: LogicalId;
    /**
     * Properties of the Resource.
     */
    Props: Props;
    /**
     * Removal Policy of the Resource.
     */
    RemovalPolicy: RemovalPolicy["Service"];
    /**
     * Per-resource adoption policy captured from the ambient {@link AdoptPolicy}
     * at registration time (e.g. via `.pipe(adopt(true))`). `undefined` means no
     * resource-scoped override — the planner falls back to the stack/CLI default.
     */
    Adopt: boolean | undefined;
    /**
     * Per-resource provider mode captured from the ambient
     * {@link ProviderModePolicy} at registration time. `"live"` when the
     * resource was pinned via `.pipe(remote())` (opting out of local emulation
     * during dev); `undefined` means the run default (`AlchemyContext.dev`).
     */
    Mode: ProviderMode | undefined;
    /**
     * Copied from {@link ResourceOptions.requiresImplementation} at
     * registration: `true` for platform-typed resources, whose registrations
     * must have resolved {@link Props} by plan time. `Plan.make` fails fast
     * with {@link MissingImplementationError} when this is set and `Props`
     * are still `undefined` after the whole program has evaluated — a bare
     * tag was yielded but its `.make(props, impl)` Layer was never provided.
     */
    RequiresImplementation: boolean | undefined;
    /**
     * Former FQNs this resource's state may still be persisted under,
     * captured from the ambient {@link RenamePolicy} at registration (via
     * `.pipe(renamedFrom("OldId"))`) and resolved against the same namespace
     * as the resource's own FQN. The planner migrates a state row found at a
     * former FQN to {@link FQN} instead of planning a create+delete
     * replacement — see `renamedFrom` in Rename.ts for the full semantics.
     */
    FormerFqns: readonly string[] | undefined;
    /** @internal phantom */
    Attributes: Attributes;
    /** @internal phantom */
    Binding: Binding;
    /** @internal phantom */
    Providers: Providers;
}
export declare const isResource: (value: any) => value is ResourceLike;
/**
 * Does `value` reference an instance of the resource type `type` —
 * either a locally-declared resource or a `Resource.ref(...)` to one?
 *
 * Two constraints that ad-hoc guards get wrong for refs, which resolve
 * to Output-expression proxies:
 *
 * - Read `.Type` via property access (never `in`): the proxy answers
 *   property reads with statically-known values but deliberately does
 *   not report key existence (so {@link isResource} keeps routing refs
 *   through Output resolution instead of the upstream-node lookup).
 * - Accept `typeof value === "function"`: the proxy's target is
 *   callable (it needs an `apply` trap), so refs are not `"object"`.
 *
 * Either mistake silently rejects refs — in a Worker `env` that
 * degrades the binding to a plain JSON var.
 */
export declare const isResourceOfType: (value: unknown, type: string) => boolean;
export type Resource<Type extends string = any, Props extends object | undefined = any, Attributes extends object = any, Binding = never, Providers = undefined> = Pipeable & ResourceLike<Type, Props, Attributes, Binding, Providers> & {
    bind(sid: Input<string>, binding: Input<Binding>): Effect.Effect<void>;
    bind(template: TemplateStringsArray, ...args: any[]): (binding: Input<Binding>) => Effect.Effect<void>;
} & {
    [attr in keyof Attributes]-?: AttrOutput<Attributes[attr]>;
};
/**
 * Accessor type for one attribute. Pure object attributes upgrade to
 * {@link Output.ObjectExpr} so nested access is typed —
 * `hyperpod.instanceGroups.workers` — while primitives, unions with
 * `undefined`, branded string unions (`"a" | (string & {})`), and arrays
 * stay plain {@link Output.Output} (running them through `ToOutput` would
 * classify the `string & {}` branch as an object and explode into
 * String-method mapped types).
 */
type AttrOutput<A> = [A] extends [
    string | number | boolean | bigint | null | undefined | Date | any[]
] ? Output.Output<A, never> : [A] extends [Record<string, any>] ? Output.ObjectExpr<A, never> : Output.Output<A, never>;
export interface ResourceOptions {
    /**
     * Default removal policy for this resource type when the caller has not
     * explicitly provided one via `RemovalPolicy` / `destroy()` / `retain()`.
     *
     * Useful for resources that wrap unrecoverable real-world identifiers
     * (DNS zones, customer accounts, etc.) where the safe default is to
     * leave the cloud object alone on stack destroy.
     *
     * @default "destroy"
     */
    defaultRemovalPolicy?: RemovalPolicy["Service"];
    /**
     * Legacy type names this resource was previously registered under.
     *
     * When a resource type is renamed (e.g. `"Cloudflare.Queue"` →
     * `"Cloudflare.Queues.Queue"`), state persisted under the old name must
     * still resolve to this resource's provider. Listing the old names here
     * makes provider lookup fall back from the legacy name to this type, so
     * existing stacks keep planning, updating, and deleting cleanly across
     * the rename. The state row migrates to the new type on its next write.
     *
     * ```ts
     * export const Queue = Resource<Queue>("Cloudflare.Queues.Queue", {
     *   aliases: ["Cloudflare.Queue"],
     * });
     * ```
     */
    aliases?: string[];
    /**
     * Marks every registration of this type as requiring resolved props by
     * plan time. Set by `Platform(...)` on its resource class: every
     * legitimate platform construction (a `.make(props, impl)` Layer build,
     * a tag declared with props, a plain `Worker("id", props)` call) produces
     * defined `Props` — the only way a platform-typed registration reaches
     * the planner with `Props === undefined` is a bare-tag FORWARD REFERENCE
     * whose `.make` Layer never built. `Plan.make` fails fast with
     * {@link MissingImplementationError} in that case, instead of letting a
     * provider read `undefined` props. Plain (non-platform) resources leave
     * this unset so a no-props reference yield (`yield* Queue("MyQueue")`)
     * keeps planning as a noop.
     */
    requiresImplementation?: boolean;
}
declare const MissingImplementationError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "MissingImplementationError";
} & Readonly<A>;
/**
 * A tagged platform resource declared with neither props nor an inline
 * implementation was `yield*`ed, but its `.make(props, impl)` Layer never
 * built.
 *
 * Such a tag carries no configuration on its own — props AND impl both live
 * on the Layer — so its registration is a forward reference with `undefined`
 * props that the Layer's build repairs (in either order; see the #874
 * circular env-tag pattern). Props still `undefined` once the whole program
 * has evaluated means the Layer was never provided; `Plan.make` fails fast
 * with this error instead of letting the failure surface deep inside
 * whichever provider first reads a prop (e.g. `TypeError: undefined is not
 * an object (evaluating 'news.name')` in the Cloudflare Worker pre-create).
 */
export declare class MissingImplementationError extends MissingImplementationError_base<{
    message: string;
    /** Resource type of the platform, e.g. `Cloudflare.Worker`. */
    type: string;
    /** Logical id of the tagged resource (its class name by convention). */
    id: string;
}> {
}
export declare const missingImplementation: (type: string, id: string) => MissingImplementationError;
/**
 * Creates a resource constructor for a concrete resource type.
 *
 * The returned constructor registers the resource on the current stack,
 * resolves input props, exposes output attributes as `Output` expressions, and
 * records bindings contributed by policies and event sources. Resource
 * providers are attached separately through `.provider`.
 */
export declare function Resource<R extends ResourceLike>(type: R["Type"], options?: ResourceOptions): ResourceClass<R>;
export {};
//# sourceMappingURL=Resource.d.ts.map