import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Metric from "effect/Metric";
/**
 * Counter for resource lifecycle operations. Tagged per call with
 * `resource_type`, `op` (`precreate`/`create`/`update`/`delete`/`read`),
 * and `status` (`success`/`error`).
 */
export declare const resourceCounter: Metric.Counter<number>;
/**
 * Histogram of how long each lifecycle operation takes.
 */
export declare const resourceDuration: Metric.Histogram<Duration.Duration>;
/**
 * Counter for CLI command invocations.
 */
export declare const cliCounter: Metric.Counter<number>;
/**
 * Counter for Cloudflare State Store bootstrap/deploy operations.
 * Tagged per call with `op` (e.g. `deploy`) and `status`
 * (`success`/`error`) so that the deploy success rate of the
 * state store itself can be tracked separately from regular
 * resource lifecycle ops.
 */
export declare const stateStoreCounter: Metric.Counter<number>;
export type StateStoreOp = "deploy";
/**
 * Counter for State store layer construction. Tagged with `id` (the
 * `StateService.id` slug) so we can answer "how many distinct projects
 * are using each backend" from the corresponding `state_store.init`
 * spans. Open-ended on purpose: third-party state stores get counted
 * automatically by setting their `StateService.id`.
 */
export declare const stateStoreInitCounter: Metric.Counter<number>;
/**
 * Wraps a resource lifecycle Effect to record a counter + timer entry,
 * tagged with `resource_type`, `op`, and `status` (`success`/`error`).
 *
 * Usage:
 * ```ts
 * provider.reconcile(input).pipe(recordResourceOp(node.resource.Type, "create"))
 * ```
 */
export declare const recordResourceOp: (resourceType: string, op: ResourceOp) => <A, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * Wraps a CLI command Effect to bump {@link cliCounter} with the
 * outcome (`success`/`error`).
 */
export declare const recordCli: (command: string) => <A, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * Wraps a Cloudflare State Store deploy/bootstrap Effect to bump
 * {@link stateStoreCounter} with the outcome (`success`/`error`),
 * tagged with the given `op`.
 */
export declare const recordStateStoreOp: (op: StateStoreOp) => <A, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * Wraps a State store construction Effect to:
 *
 * 1. Bump {@link stateStoreInitCounter} tagged with `id`.
 * 2. Open a `state_store.init` span carrying
 *    `alchemy.state_store.id` so Axiom (which can't query metric
 *    datasets via APL) can group projects by backend.
 *
 * The `id` is read off the constructed `StateService.id` field, so any
 * third-party state-store implementation gets tracked just by setting
 * a stable slug there. Apply at every `Layer.effect(State, …)` site
 * exactly once.
 */
export declare const recordStateStoreInit: <A extends {
    readonly id: string;
}, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
export type ResourceOp = "precreate" | "create" | "update" | "delete" | "read";
//# sourceMappingURL=Metrics.d.ts.map