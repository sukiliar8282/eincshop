import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
declare const Artifacts_base: Context.ServiceClass<Artifacts, "Artifacts", {
    /**
     * Get an artifact by key from the current resource's bag.
     */
    get<T>(key: string): Effect.Effect<T | undefined>;
    /**
     * Store an artifact by key in the current resource's bag.
     */
    set<T>(key: string, value: T): Effect.Effect<void>;
    /**
     * Delete an artifact by key from the current resource's bag.
     */
    delete(key: string): Effect.Effect<void>;
}>;
/**
 * Per-resource in-memory artifacts shared across a single `Plan.make -> apply`
 * execution.
 *
 * The engine scopes this service by resource `FQN` before invoking lifecycle
 * handlers, so providers should treat it as a resource-local bag for expensive,
 * deterministic intermediate results that can be reused across phases.
 *
 * Expected usage:
 *
 * - `diff` computes an expensive artifact once and stores it
 * - `create` / `update` reads the same artifact and skips recomputing it
 * - artifacts are ephemeral and must never be required for correctness on a
 *   later deploy because the bag is reset between runs
 *
 * Example:
 *
 * ```ts
 * const artifacts = yield* Artifacts;
 * const cached = yield* artifacts.get<PreparedBundle>("bundle");
 * if (cached) return cached;
 *
 * const bundle = yield* prepareBundle();
 * yield* artifacts.set("bundle", bundle);
 * return bundle;
 * ```
 */
export declare class Artifacts extends Artifacts_base {
}
type ArtifactBag = Map<string, unknown>;
declare const ArtifactStore_base: Context.ServiceClass<ArtifactStore, "Artifacts/Store", Map<string, ArtifactBag>>;
export declare class ArtifactStore extends ArtifactStore_base {
}
/**
 * Create a fresh root store for one deploy/test run.
 */
export declare const createArtifactStore: () => ArtifactStore["Service"];
export declare const makeScopedArtifacts: (store: Map<string, ArtifactBag>, fqn: string) => Artifacts["Service"];
export declare const scopedArtifacts: (fqn: string) => Layer.Layer<Artifacts, never, ArtifactStore>;
/**
 * Run an effect with a fresh artifact root, replacing any existing store.
 * Use this at top-level entrypoints that intentionally define a new deploy run.
 */
export declare const provideFreshArtifactStore: <A, E, R>(effect: Effect.Effect<A, E, R | ArtifactStore>) => Effect.Effect<A, E, R>;
/**
 * Ensure an artifact root exists, reusing the ambient store when one is already
 * present. This lets nested helpers participate in the same run-scoped cache.
 */
export declare const ensureArtifactStore: <A, E, R>(effect: Effect.Effect<A, E, R | ArtifactStore>) => Effect.Effect<A, E, R>;
export declare const cached: (id: string) => <A, Err = never, Req = never>(eff: Effect.Effect<A, Err, Req>) => Effect.Effect<A, Err, Req | Artifacts>;
export {};
//# sourceMappingURL=Artifacts.d.ts.map