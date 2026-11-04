import * as Effect from "effect/Effect";
/**
 * OTel resource attributes describing the user, project, runtime, and
 * environment running the alchemy CLI. Computed once per process and
 * attached to every span and metric exported by `TelemetryLive`.
 */
export interface TelemetryAttributes {
    readonly "alchemy.user.id": string;
    readonly "alchemy.session.id": string;
    readonly "alchemy.version": string;
    readonly "alchemy.git.root_commit": string;
    readonly "alchemy.git.origin_hash": string;
    readonly "alchemy.git.branch_hash": string;
    readonly "alchemy.runtime.name": string;
    readonly "alchemy.runtime.version": string;
    readonly "alchemy.ci.provider": string;
    readonly "alchemy.ci": boolean;
    readonly "host.arch": string;
    readonly "os.type": string;
    readonly "os.version": string;
    readonly "host.cpus": number;
    readonly "host.memory_mb": number;
}
/**
 * `true` if telemetry is disabled via environment variable
 * (`DO_NOT_TRACK`, `NO_TRACK`, `ALCHEMY_TELEMETRY_DISABLED`) or via a
 * persisted opt-out file at `~/.alchemy/telemetry-disabled`.
 */
export declare const isTelemetryDisabled: Effect.Effect<boolean>;
/**
 * Persists an opt-out so future invocations skip telemetry without needing
 * an env var.
 */
export declare const setTelemetryDisabled: Effect.Effect<void>;
export declare const setTelemetryEnabled: Effect.Effect<void>;
/**
 * Resolves the {@link TelemetryAttributes} for the current process. Cached
 * so file I/O and `git` invocations only run once per CLI invocation; every
 * subsequent caller gets the same record (and therefore the same session
 * id).
 */
export declare const collectAttributes: Effect.Effect<TelemetryAttributes>;
//# sourceMappingURL=Attributes.d.ts.map