/**
 * The credential-demand seam for credential-free `alchemy dev`.
 *
 * A dev run whose plan is entirely local must never touch (or prompt for)
 * cloud credentials. When the plan DOES need the cloud — a resource opted
 * out of local emulation via `Alchemy.remote()`, a local Worker binding
 * that proxies to a remote resource (`dev: { remote: true }`), or the
 * deletion of a row that was last reconciled live — credentials are
 * validated up front, BEFORE apply begins: the gate resolves each demanded
 * provider's credentials through the same precedence the run will use. The
 * seam never starts a login flow: missing credentials fail with the typed
 * {@link CredentialsRequired} error naming the demanding resources and
 * pointing at `alchemy profile edit` — the profile command is the only
 * place logins happen.
 *
 * How deep the up-front resolution goes is PROVIDER-DEPENDENT — it runs
 * the provider's `read`, no more:
 *
 * - Cloudflare's `read` eagerly checks OAuth expiry, silently refreshes,
 *   and persists under the profile lock — so a dead refresh token fails
 *   here as a typed `NeedsReauth`, and child processes (which only ever
 *   read what a parent persisted) start with a warm token.
 * - AWS's `read` returns a credentials RECIPE whose inner effect stays
 *   unevaluated (SSO tokens are loaded lazily by consumers), so an
 *   expired SSO token passes the gate and still surfaces mid-run. Local-mode
 *   AWS providers carry a floci-scoped environment of their own (see
 *   `AWS/Local/FlociServices.ts`) and ensure the emulator there.
 *
 * The demand scan keys on provider MODE, not plan action — noop live rows
 * still demand (their runtime proxies need live credentials to serve), so
 * a watch restart re-runs this resolution even for an unchanged plan.
 *
 * Non-dev runs (`alchemy deploy` / `destroy`) never enter this seam:
 * state-store init and live providers drive the pre-existing lazy
 * credential-resolution flow unchanged.
 */
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import type { Plan } from "../Plan.ts";
import { AuthError, NeedsReauth } from "./AuthProvider.ts";
/** Why a plan row demands live (cloud) credentials during a dev run. */
export type CredentialDemandReason = 
/** The resource's resolved provider mode is `"live"` (`Alchemy.remote()`). */
"remote"
/** Binding data carries a truthy `devRemote` entry — the local runtime proxies this binding to the real cloud. */
 | "remote-binding"
/** The plan deletes a row stamped `providerMode: "live"` — the live provider must run to delete it. */
 | "live-delete";
export interface DemandingResource {
    /** FQN of the demanding resource within the stack. */
    readonly fqn: string;
    readonly reason: CredentialDemandReason;
}
/**
 * All the resources of one cloud provider that demand live credentials.
 * `provider` is the auth-provider name, derived from the resource Type's
 * leading namespace segment (`"AWS.S3.Bucket"` → `"AWS"`, matching the
 * name the cloud's auth provider registers under).
 */
export interface CredentialDemand {
    readonly provider: string;
    readonly resources: readonly DemandingResource[];
}
declare const CredentialsRequired_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "CredentialsRequired";
} & Readonly<A>;
/**
 * A dev-mode plan needs cloud credentials and none are configured for the
 * active profile. The message names the demanding resources and the exact
 * `alchemy profile edit` invocation that fixes it.
 */
export declare class CredentialsRequired extends CredentialsRequired_base<{
    message: string;
    /** Auth-provider name whose credentials are missing (e.g. `"AWS"`). */
    provider: string;
    /** FQNs of the resources demanding the credentials. */
    resources: string[];
    /** Short summary of why the credentials are needed. */
    reason: string;
}> {
}
/**
 * Build the typed {@link CredentialsRequired} failure for a demand.
 * Exported so tests can pin the message format.
 */
export declare const credentialsRequired: (demand: CredentialDemand, profileName: string) => Effect.Effect<never, CredentialsRequired>;
/**
 * Scan a plan for rows that need live (cloud) credentials during a dev
 * run, grouped by cloud provider:
 *
 *   1. resources whose resolved provider mode is `"live"` (`Alchemy.remote()`)
 *   2. resources whose binding data carries a truthy `devRemote` entry
 *      (the local runtime proxies that binding to the real cloud)
 *   3. planned deletions of rows stamped `providerMode: "live"`
 *
 * Pure and side-effect-free — callers gate on the run being a dev run
 * (in a live run every dual-provider row resolves `"live"` and the
 * pre-existing lazy credential flow applies instead).
 *
 * Mode-agnostic rows (`mode === undefined`, single-implementation
 * providers that run live even in dev) are deliberately NOT collected:
 * they resolve credentials lazily exactly as they do today.
 */
export declare const collectCredentialDemands: (plan: Plan) => CredentialDemand[];
/**
 * Validate credentials for every demand. Never starts a login flow —
 * logging in belongs to `alchemy profile edit` exclusively:
 *
 *   - configured for the active profile → resolve the credentials through
 *     the exact precedence the run will use ({@link resolveProviderConfig}:
 *     CI environment, explicit env vars, then the profile). Resolution
 *     runs the provider's `read` — how much that validates and warms is
 *     provider-dependent (see the module header): Cloudflare eagerly
 *     refreshes and persists so a dead refresh token fails HERE as a
 *     typed {@link NeedsReauth} naming the demanding resources, while
 *     AWS's lazy credential recipe defers SSO-token failures to mid-run.
 *   - missing → typed {@link CredentialsRequired} failure with the exact
 *     `alchemy profile edit` invocation to run
 *   - CI → validates the provider's environment credentials directly,
 *     matching every other CI path without creating profile state
 *
 * Demands whose cloud has no registered auth provider are skipped (bare
 * engine runs with test providers demand nothing). All context is
 * resolved optionally, so the effect is safe to run in any environment —
 * and a plan with zero demand touches no credentials at all.
 */
export declare const demandCredentials: (demands: readonly CredentialDemand[]) => Effect.Effect<void, AuthError | Config.ConfigError | CredentialsRequired | NeedsReauth | import("effect/PlatformError").PlatformError | import("./Profile.ts").ProfileError, never>;
/**
 * Plan-time seam for `Alchemy.remote()` rows. The planner probes every new
 * resource with its provider's `read` (engine-level adoption) — for a
 * live-mode row in a dev run that is a real cloud call, made BEFORE
 * {@link demandPlanCredentials} could run in apply. Demanding here first
 * turns "nothing configured" into the typed {@link CredentialsRequired}
 * (naming the rows and the exact `alchemy profile edit` command) instead
 * of whatever raw error the first credential-less read produces. Bindings
 * and live deletions are still gated in apply — nothing reads for them
 * during plan.
 */
export declare const demandRemoteCredentials: (resources: ReadonlyArray<{
    readonly Type: string;
    readonly FQN: string;
}>) => Effect.Effect<void, AuthError | Config.ConfigError | CredentialsRequired | NeedsReauth | import("effect/PlatformError").PlatformError | import("./Profile.ts").ProfileError, never>;
/**
 * The one-call seam wired into the dev path: scan the plan for live
 * demand and, if any, run {@link demandCredentials} BEFORE apply begins.
 */
export declare const demandPlanCredentials: (plan: Plan) => Effect.Effect<void, AuthError | Config.ConfigError | CredentialsRequired | NeedsReauth | import("effect/PlatformError").PlatformError | import("./Profile.ts").ProfileError, never>;
export {};
//# sourceMappingURL=Demand.d.ts.map