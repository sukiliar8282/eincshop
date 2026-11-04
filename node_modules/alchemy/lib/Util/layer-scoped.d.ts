import type * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type * as Scope from "effect/Scope";
/**
 * Builds a layer with the current scope.
 * @param layer - The layer to build.
 * @returns A scoped effect returning a Context with the provided layer.
 */
export declare const buildLayerScoped: <ROut, E, RIn>(layer: Layer.Layer<ROut, E, RIn>) => Effect.Effect<Context.Context<ROut>, E, RIn | Scope.Scope>;
/**
 * Builds a layer with the current scope and provides it to the given effect.
 * @param layer - The layer to build.
 */
export declare const provideLayerScoped: <ROut, E1, RIn>(layer: Layer.Layer<ROut, E1, RIn>) => <A, E2, R>(effect: Effect.Effect<A, E2, R>) => Effect.Effect<A, E1 | E2, RIn | Scope.Scope | Exclude<R, ROut>>;
//# sourceMappingURL=layer-scoped.d.ts.map