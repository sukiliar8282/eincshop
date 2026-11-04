import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Runtime from "effect/Runtime";
import * as CliError from "effect/unstable/cli/CliError";
import { UserFacingError } from "../../UserFacingError.ts";
export declare const isPromptCancellation: (error: unknown) => boolean;
export declare const EXIT_CANCELLED = 130;
export declare const setExitCode: (code: number) => Effect.Effect<void, never, never>;
export declare const exitDeclined: Effect.Effect<void, never, never>;
export declare const suppressInterruptMessages: Effect.Effect<void, never, never>;
/**
 * Keep quick shutdowns quiet, but acknowledge cleanup that takes long enough
 * to be noticeable. The Effect runtime continues to own signal handling and
 * teardown; this listener only writes delayed feedback.
 */
export declare const installShutdownFeedback: Effect.Effect<void, never, never>;
export declare const handleCancellation: <A, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<void | A, E, R>;
declare class ReportedCliError {
    readonly cause: unknown;
    readonly [Runtime.errorReported] = false;
    constructor(cause: unknown);
}
declare const UserInputError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => Cause.YieldableError & {
    readonly _tag: "UserInputError";
} & Readonly<A>;
export declare class UserInputError extends UserInputError_base<{
    readonly message: string;
}> {
    readonly [UserFacingError] = true;
}
export declare const handleUserErrors: <A, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E | ReportedCliError, R>;
export declare const handleCliErrors: <A, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<void | A, E | ReportedCliError, R>;
export declare const failWithHelp: (commandPath: ReadonlyArray<string>) => Effect.Effect<never, CliError.ShowHelp, never>;
export {};
//# sourceMappingURL=errors.d.ts.map