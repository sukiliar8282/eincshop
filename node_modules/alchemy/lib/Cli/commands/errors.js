import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as Runtime from "effect/Runtime";
import * as CliError from "effect/unstable/cli/CliError";
import { isUserFacing, UserFacingError } from "../../UserFacingError.js";
import { ANSI_DIM, ANSI_RESET, ansiFg, colorsEnabled, glyphsFor, theme, unicodeEnabled, } from "../CliKit/index.js";
const isTerminalCancelled = Schema.is(Schema.Struct({ _tag: Schema.Literals(["TerminalCancelled"]) }));
const isAuthErrorLike = Schema.is(Schema.Struct({
    _tag: Schema.Literals(["AuthError"]),
    cause: Schema.optional(Schema.Unknown),
}));
export const isPromptCancellation = (error) => {
    for (let current = error, depth = 0; current != null && depth < 16; depth++) {
        if (isTerminalCancelled(current))
            return true;
        if (!isAuthErrorLike(current))
            return false;
        current = current.cause;
    }
    return false;
};
export const EXIT_CANCELLED = 130;
export const setExitCode = (code) => Effect.sync(() => {
    process.exitCode = code;
});
export const exitDeclined = setExitCode(1);
let interruptMessagesSuppressed = false;
export const suppressInterruptMessages = Effect.sync(() => {
    interruptMessagesSuppressed = true;
});
const SHUTDOWN_FEEDBACK_DELAY_MS = 500;
/**
 * Keep quick shutdowns quiet, but acknowledge cleanup that takes long enough
 * to be noticeable. The Effect runtime continues to own signal handling and
 * teardown; this listener only writes delayed feedback.
 */
export const installShutdownFeedback = Effect.sync(() => {
    let scheduled = false;
    const onSignal = () => {
        if (scheduled || interruptMessagesSuppressed)
            return;
        scheduled = true;
        const timer = setTimeout(() => {
            process.stderr.write(colorsEnabled()
                ? `\n${ANSI_DIM}Shutting down${ANSI_RESET}\n`
                : "\nShutting down\n");
        }, SHUTDOWN_FEEDBACK_DELAY_MS);
        timer.unref();
    };
    process.on("SIGINT", onSignal);
    process.on("SIGTERM", onSignal);
});
export const handleCancellation = (self) => self.pipe(Effect.catchCause((cause) => {
    const cancelled = cause.reasons.some((reason) => {
        if (Cause.isFailReason(reason))
            return isPromptCancellation(reason.error);
        if (Cause.isDieReason(reason))
            return isPromptCancellation(reason.defect);
        return false;
    });
    return cancelled
        ? Console.log(colorsEnabled()
            ? `\n${ANSI_DIM}Cancelled.${ANSI_RESET}`
            : "\nCancelled.").pipe(Effect.andThen(setExitCode(EXIT_CANCELLED)))
        : Effect.failCause(cause);
}), Effect.onInterrupt(() => interruptMessagesSuppressed
    ? Effect.void
    : Console.log(colorsEnabled() ? `\n${ANSI_DIM}Exited.${ANSI_RESET}` : "\nExited.")));
class ReportedCliError {
    cause;
    [Runtime.errorReported] = false;
    constructor(cause) {
        this.cause = cause;
    }
}
// `ConfigError` is effect's own class and cannot carry the `UserFacingError`
// marker. Everything else is matched by the marker alone — new user-facing
// errors opt in by assigning the symbol, not by growing this list.
const isUnmarkedUserFacingError = Schema.is(Schema.Struct({
    _tag: Schema.Literals(["ConfigError"]),
    message: Schema.String,
}));
const isUserFacingError = (error) => isUserFacing(error) || isUnmarkedUserFacingError(error);
export class UserInputError extends Data.TaggedError("UserInputError") {
    [UserFacingError] = true;
}
export const handleUserErrors = (self) => self.pipe(Effect.catchCause((cause) => {
    for (const reason of cause.reasons) {
        const error = Cause.isFailReason(reason)
            ? reason.error
            : Cause.isDieReason(reason)
                ? reason.defect
                : undefined;
        if (isUserFacingError(error)) {
            const glyphs = glyphsFor(unicodeEnabled());
            return Console.error(`${colorsEnabled() ? `${ansiFg(theme.color.danger)}${glyphs.error} error:${ANSI_RESET}` : "error:"} ${error.message}`).pipe(Effect.flatMap(() => Effect.fail(new ReportedCliError(cause))));
        }
    }
    return Effect.failCause(cause);
}));
export const handleCliErrors = (self) => self.pipe(handleCancellation, handleUserErrors);
export const failWithHelp = (commandPath) => setExitCode(1).pipe(Effect.andThen(Effect.fail(new CliError.ShowHelp({ commandPath: [...commandPath], errors: [] }))));
//# sourceMappingURL=errors.js.map