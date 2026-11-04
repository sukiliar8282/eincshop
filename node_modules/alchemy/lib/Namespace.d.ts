import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
export interface NamespaceNode {
    Id: string;
    Parent?: NamespaceNode;
}
declare const Namespace_base: Context.ServiceClass<Namespace, "Alchemy/Namespace", NamespaceNode>;
export declare class Namespace extends Namespace_base {
}
export declare function push<const Id extends string, A, Err = never, Req = never>(id: Id, eff: Effect.Effect<A, Err, Req>): Effect.Effect<A, Err, Req>;
export declare function push<const Id extends string>(id: Id): <A, Err = never, Req = never>(eff: Effect.Effect<A, Err, Req>) => Effect.Effect<A, Err, Req>;
export declare const set: (namespace: string | NamespaceNode) => <A, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, Exclude<R, Namespace>>;
export declare const CurrentNamespace: Effect.Effect<NamespaceNode | undefined, never, never>;
export declare const CurrentChain: Effect.Effect<string[], never, never>;
export declare const Parent: Effect.Effect<NamespaceNode | undefined, never, Namespace>;
export declare const Root: Effect.Effect<NamespaceNode, never, Namespace>;
export {};
//# sourceMappingURL=Namespace.d.ts.map