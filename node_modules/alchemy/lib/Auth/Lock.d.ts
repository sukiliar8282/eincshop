import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
/**
 * Make a lock key safe to use as a file name on every platform.
 *
 * Keys are derived from user-controlled values (profile names), which
 * have shown up in production containing shell placeholders like
 * `${ALCHEMY_PROFILE:-default}` — `:`/`{`/`$` are invalid in Windows
 * file names and mkdir fails with EINVAL. Collapse anything outside a
 * conservative allow-list to `_`.
 *
 * @internal exported for unit testing.
 */
export declare const sanitizeLockKey: (key: string) => string;
/**
 * Serialise execution of `effect` for the same `key`, both within this
 * process (a semaphore) and across processes on the same machine (an atomic
 * lock directory whose mtime is refreshed while held so another process can
 * recover it after a crash).
 *
 * Failure to create or acquire the lock is fatal. Authentication writes its
 * profile state beneath the same root, so continuing without a writable lock
 * cannot produce a valid deployment and would permit concurrent corruption.
 */
export declare const withLock: <A, E, R>(key: string, effect: Effect.Effect<A, E, R>, options?: {
    readonly timeout?: Duration.Input;
    /**
     * Human-readable name of the work being serialised, used in the debug
     * log lines and the stall notice. Defaults to `key`.
     */
    readonly label?: string;
    /**
     * Print a periodic notice to stderr while this lock is being waited on
     * or held (see {@link stallNotice}). Pass `false` for flows that
     * legitimately block on the user — a browser OAuth round-trip, an
     * `aws sso login` child process — where a repeating notice would be
     * both wrong and destructive to the prompt on screen.
     *
     * @default true
     */
    readonly watchdog?: boolean;
    /**
     * Interval between stall notices.
     *
     * @internal exposed so tests need not wait 30 real seconds.
     */
    readonly stallInterval?: Duration.Input;
}) => Effect.Effect<A, E, FileSystem.FileSystem | Path.Path | Exclude<R, import("effect/Scope").Scope>>;
/**
 * Serialize an operation with every credential mutation for a profile. The
 * lock key is shared by every credential operation for the profile,
 * including profile-wide rename and delete operations.
 */
export declare const withProfileCredentialsLock: <A, E, R>(profileName: string, effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, FileSystem.FileSystem | Path.Path | Exclude<R, import("effect/Scope").Scope>>;
//# sourceMappingURL=Lock.d.ts.map