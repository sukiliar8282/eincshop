/**
 * Contains props, error tags, and the live service for executing commands.
 * Shared between the `Build`, `Dev`, and `Exec` resources.
 */
import * as Context from "effect/Context";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Path from "effect/Path";
import { BadArgument, SystemError } from "effect/PlatformError";
import * as Redacted from "effect/Redacted";
import type * as Scope from "effect/Scope";
import * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner";
import type { ScopedPlanStatusSession } from "../Report.ts";
/**
 * Base properties for a command resource.
 */
export interface CommandProps {
    /**
     * The command to run.
     */
    command: string;
    /**
     * Working directory for the command. Defaults to `process.cwd()`.
     */
    cwd?: string;
    /**
     * If set to true, runs the command inside of a shell, defaulting to /bin/sh on UNIX systems and cmd.exe on Windows.
     * It is generally discouraged to use this option, as it can lead to security vulnerabilities and is not portable.
     * If set to a string, runs the command inside of the specified shell.
     * @default false
     */
    shell?: string | boolean;
    /**
     * Extra environment variables passed to the command on top of `process.env`.
     * Entries whose value is `undefined` are dropped — this lets website
     * composites forward optional values (e.g. an `Output` service URL that
     * resolves to `undefined`) without filtering first.
     */
    env?: Record<string, string | Redacted.Redacted<string> | undefined>;
}
/**
 * Properties shared by finite commands such as {@link Build} and
 * {@link Exec}.
 */
export interface CommandRunProps extends CommandProps {
    /**
     * Maximum time the command may run. When exceeded, Alchemy sends `SIGTERM`
     * to the command's process group, waits a bounded grace period, and then
     * sends `SIGKILL` to ensure no descendants survive.
     *
     * Numbers are interpreted as milliseconds. Effect duration strings and
     * `Duration` values are also accepted.
     *
     * @example "5 minutes"
     */
    timeout?: Duration.Input;
}
declare const CommandExecutor_base: Context.ServiceClass<CommandExecutor, "alchemy/Command/CommandExecutor", {
    /**
     * Spawns a command, returning the child process handle.
     */
    readonly spawn: (props: CommandProps) => Effect.Effect<ChildProcessSpawner.ChildProcessHandle, CommandError, Scope.Scope>;
    /**
     * Executes a command, returning the exit code, stdout, and stderr.
     * Throws a {@link CommandError} if the command exits with a non-zero exit code.
     */
    readonly run: (props: CommandRunProps, session: ScopedPlanStatusSession) => Effect.Effect<{
        exitCode: number;
        stdout: string;
        stderr: string;
    }, CommandError>;
}>;
export declare class CommandExecutor extends CommandExecutor_base {
}
declare const CommandError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "CommandError";
} & Readonly<A>;
/**
 * Extends Effect's `PlatformError` to include the command that failed and some command-specific error reasons.
 */
export declare class CommandError extends CommandError_base<{
    command: string;
    reason: SystemError | BadArgument | UnexpectedExit | OutputNotFound | CommandTimedOut;
    cause?: unknown;
}> {
    constructor({ command, reason, }: {
        command: string;
        reason: CommandError["reason"];
    });
    get message(): string;
}
export declare const isCommandError: (error: unknown) => error is CommandError;
declare const UnexpectedExit_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "UnexpectedExit";
} & Readonly<A>;
/**
 * Represents when a command exits unexpectedly.
 */
export declare class UnexpectedExit extends UnexpectedExit_base<{
    exitCode: number;
    stderr: string;
}> {
    get message(): string;
}
declare const CommandTimedOut_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "CommandTimedOut";
} & Readonly<A>;
/**
 * Represents when a finite command exceeds its configured timeout.
 */
export declare class CommandTimedOut extends CommandTimedOut_base<{
    timeout: string;
}> {
    get message(): string;
}
declare const OutputNotFound_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "OutputNotFound";
} & Readonly<A>;
/**
 * Represents when the output directory does not exist.
 */
export declare class OutputNotFound extends OutputNotFound_base<{
    outdir: string;
}> {
    get message(): string;
}
/** @internal */
export declare const makeCommandError: (props: Pick<CommandProps, "command" | "env">, reason: CommandError["reason"]) => CommandError;
export declare const CommandExecutorLive: () => Layer.Layer<CommandExecutor, never, ChildProcessSpawner.ChildProcessSpawner | Path.Path>;
export {};
//# sourceMappingURL=Command.d.ts.map