import * as ps from "@distilled.cloud/planetscale";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import type { ScopedPlanStatusSession } from "../Report.ts";
declare const NotReady_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Planetscale::NotReady";
} & Readonly<A>;
/**
 * Tagged error raised when polling for a state predicate that has not yet
 * been reached. Used internally with `Effect.retry` to drive long-running
 * status waits.
 */
export declare class NotReady extends NotReady_base<{
    description: string;
}> {
}
declare const PlanetscaleConflict_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Planetscale::Conflict";
} & Readonly<A>;
/**
 * Tagged error raised by reconcilers when an immutable property of a live
 * PlanetScale resource does not match the desired configuration (e.g.
 * region, kind, parent_branch). User-recoverable: change the config to
 * match, or replace/delete the existing resource and retry.
 */
export declare class PlanetscaleConflict extends PlanetscaleConflict_base<{
    message: string;
}> {
}
/**
 * Generic polling helper that retries until `predicate(value)` returns true
 * (or until the schedule is exhausted). Engine-specific helpers (e.g.
 * `waitForKeyspaceReady`, `waitForPendingPostgresChanges`) are built on top
 * of this primitive.
 */
export declare const pollUntil: <A, E, R>(description: string, fn: Effect.Effect<A, E, R>, predicate: (value: A) => boolean, schedule?: Schedule.Schedule<unknown, unknown, never>) => Effect.Effect<A, E, R>;
/**
 * Polls a branch via `getBranch` until it reports `ready === true`. Returns
 * the final branch shape. `NotFound` during polling is treated as
 * not-yet-ready (the branch is being provisioned by an upstream operation).
 *
 * If a `session` is supplied, each poll emits a note with elapsed seconds and
 * expectation-setting so the CLI surfaces progress while we sit in the spaced
 * retry loop.
 */
export declare const waitForBranchReady: (organization: string, database: string, branch: string, session?: ScopedPlanStatusSession | undefined) => Effect.Effect<ps.DatabaseBranch, ps.BadGateway | ps.BadRequest | ps.ConfigError | ps.Conflict | ps.Forbidden | ps.Services.planetscale.Forbidden | ps.GatewayTimeout | import("effect/unstable/http/HttpClientError").HttpClientError | ps.InternalServerError | ps.Locked | NotReady | ps.ServiceUnavailable | ps.TooManyRequests | ps.Unauthorized | ps.UnknownPlanetScaleError | ps.UnprocessableEntity, ps.PlanetScaleOpContext>;
/**
 * Polls a database via `getDatabase` until it reports `ready === true`.
 * `NotFound` during polling is treated as not-yet-ready (the database is
 * being provisioned by an upstream operation).
 *
 * If a `session` is supplied, each poll emits a note with elapsed seconds and
 * expectation-setting so the CLI surfaces progress while we sit in the spaced
 * retry loop.
 */
export declare const waitForDatabaseReady: (organization: string, database: string, session?: ScopedPlanStatusSession | undefined) => Effect.Effect<ps.Database, ps.BadGateway | ps.BadRequest | ps.ConfigError | ps.Conflict | ps.Forbidden | ps.Services.planetscale.Forbidden | ps.GatewayTimeout | import("effect/unstable/http/HttpClientError").HttpClientError | ps.InternalServerError | ps.Locked | NotReady | ps.ServiceUnavailable | ps.TooManyRequests | ps.Unauthorized | ps.UnknownPlanetScaleError | ps.UnprocessableEntity, ps.PlanetScaleOpContext>;
export declare const isKnownError: (tag: string, message: string) => (error: unknown) => boolean;
export {};
//# sourceMappingURL=Util.d.ts.map