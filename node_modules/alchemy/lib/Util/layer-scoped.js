import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
/**
 * Builds a layer with the current scope.
 * @param layer - The layer to build.
 * @returns A scoped effect returning a Context with the provided layer.
 */
export const buildLayerScoped = (layer) => Effect.flatMap(Effect.scope, (scope) => Layer.buildWithScope(layer, scope));
/**
 * Builds a layer with the current scope and provides it to the given effect.
 * @param layer - The layer to build.
 */
export const provideLayerScoped = (layer) => (effect) => Effect.flatMap(buildLayerScoped(layer), (context) => Effect.provideContext(effect, context));
//# sourceMappingURL=layer-scoped.js.map