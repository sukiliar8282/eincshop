import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as LogLevel from "effect/LogLevel";
import { Path } from "effect/Path";
/**
 * The console keeps its usual Info+ noise floor by default; everything below
 * it exists only for the run log, so support requests can start with "attach
 * the file from ~/.alchemy/logs". An explicit `--log-level` lowers the floor
 * for that run so `--log-level debug` actually puts debug records on the
 * terminal (#1231) — the run log captures Debug regardless.
 *
 * Read from argv rather than `GlobalFlag.LogLevel` because the console logger
 * is installed while the service layers are built, before the parser has
 * produced flag values (same reason `--no-input` is an argv scan). Only the
 * segment before a `--` separator is inspected; an unrecognised value falls
 * back to Info and is left for the parser to reject.
 */
export declare const consoleLogFloor: (argv: ReadonlyArray<string>) => LogLevel.LogLevel;
/** Terminal sink: forwards records at or above `floor` to `sink`. */
export declare const makeConsoleLogger: (floor: LogLevel.LogLevel, sink?: Logger.Logger<unknown, void>) => Logger.Logger<unknown, void>;
/** Shared terminal logger for CLI entrypoints that do not need a run file. */
export declare const ConsoleLogLive: Layer.Layer<never, never, never>;
/**
 * Debug run log for the whole CLI under `~/.alchemy/logs` (relocated by
 * `ALCHEMY_HOME` together with the rest of the auth state). Every run writes
 * `{timestamp}-pid{pid}.log` in logfmt at Debug level — profile/auth flows
 * and command failures record their full causes there even though the
 * terminal only shows the friendly message. Console output stays at Info+
 * unless `--log-level` lowers the floor (see {@link consoleLogFloor}).
 *
 * Commands that install their own loggers with `mergeWithExisting: true`
 * compose with this one; a replacing `Logger.layer` scopes it out for that
 * subtree only. Best-effort throughout: an unwritable `~/.alchemy` must
 * never take the CLI down with it.
 */
export declare const GlobalLogLive: Layer.Layer<never, never, FileSystem.FileSystem | Path>;
/** First line of every run log: enough context to read it standalone. */
export declare const logRunHeader: Effect.Effect<void>;
//# sourceMappingURL=GlobalLog.d.ts.map