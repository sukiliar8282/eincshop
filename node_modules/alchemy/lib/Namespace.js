import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
export class Namespace extends Context.Service()("Alchemy/Namespace") {
}
export function push(id, eff) {
    return eff
        ? Effect.flatMap(CurrentNamespace, (parent) => Effect.provideService(eff, Namespace, {
            Id: id,
            Parent: parent,
        }))
        : (eff) => push(id, eff);
}
export const set = (namespace) => Effect.provideService(Namespace, typeof namespace === "string" ? { Id: namespace } : namespace);
export const CurrentNamespace = Effect.serviceOption(Namespace)
    .pipe(Effect.map(Option.getOrUndefined));
export const CurrentChain = CurrentNamespace.pipe(Effect.map(function findRoot(ns) {
    if (ns?.Parent) {
        return [ns.Id, ...findRoot(ns.Parent)];
    }
    return ns ? [ns.Id] : [];
}));
export const Parent = Namespace.pipe(Effect.map((ns) => ns?.Parent));
export const Root = Namespace.pipe(Effect.map(function findRoot(ns) {
    if (ns.Parent) {
        return findRoot(ns.Parent);
    }
    return ns;
}));
//# sourceMappingURL=Namespace.js.map