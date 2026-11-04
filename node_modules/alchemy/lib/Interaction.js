/**
 * The engine's capability contract for talking to a human.
 *
 * `Interaction` is the narrow, presentation-free slice of terminal
 * interaction that non-CLI code (auth flows, the state store, engine
 * surfaces) may use: plain-string messages, a handful of prompt shapes,
 * and `task`. Nothing in its vocabulary knows a renderer exists — the CLI
 * provides an implementation backed by its terminal UI kit (see
 * `Cli/CliKit/interaction.ts`), while every other process gets
 * {@link layerNonInteractive}: messages render as plain status lines and
 * every prompt fails with the typed {@link NonInteractiveTerminal}.
 *
 * Child processes (the RPC sidecar, spawned dev children) deliberately do
 * NOT provide this service at all — interaction capability is structural,
 * not configured. Code that might need a human declares it; a process that
 * cannot reach one simply doesn't have the service in its graph.
 */
import * as Cause from "effect/Cause";
import * as Context from "effect/Context";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import { ChildProcess } from "effect/unstable/process";
import { UserFacingError } from "./UserFacingError.js";
import { ANSI_DIM, ANSI_RESET, ansiFg, colorsEnabled, } from "./Util/Terminal.js";
import { glyphsFor, statusColor } from "./Util/Theme.js";
import { unicodeEnabled } from "./Util/Terminal.js";
/** The user dismissed the active terminal interaction. */
export class TerminalCancelled extends Data.TaggedError("TerminalCancelled") {
}
/** An interactive operation was requested without an interactive terminal. */
export class NonInteractiveTerminal extends Data.TaggedError("NonInteractiveTerminal") {
    [UserFacingError] = true;
}
/** The platform's browser launcher exited unsuccessfully. */
export class BrowserOpenFailed extends Data.TaggedError("BrowserOpenFailed") {
}
/**
 * The capability to ask or tell the human driving this process. Provided
 * by the CLI (terminal-backed) or {@link layerNonInteractive} (plain
 * output, typed prompt failures); never provided in child processes.
 */
export class Interaction extends Context.Service()("Alchemy::Interaction") {
}
/** Effectful service accessors for code that must defer acquisition to use time. */
export const accessors = {
    output: {
        info: (message) => Effect.flatMap(Interaction, (service) => service.output.info(message)),
        success: (message) => Effect.flatMap(Interaction, (service) => service.output.success(message)),
        warning: (message) => Effect.flatMap(Interaction, (service) => service.output.warning(message)),
        error: (message) => Effect.flatMap(Interaction, (service) => service.output.error(message)),
    },
    prompt: {
        text: (options) => Effect.flatMap(Interaction, (service) => service.prompt.text(options)),
        password: (options) => Effect.flatMap(Interaction, (service) => service.prompt.password(options)),
        confirm: (options) => Effect.flatMap(Interaction, (service) => service.prompt.confirm(options)),
        select: (options) => Effect.flatMap(Interaction, (service) => service.prompt.select(options)),
        multiSelect: (options) => Effect.flatMap(Interaction, (service) => service.prompt.multiSelect(options)),
    },
};
/**
 * Open a URL in the platform's default browser without invoking a shell.
 *
 * Fails with {@link BrowserOpenFailed} when the launcher exits non-zero (e.g.
 * `xdg-open` with no handler installed). Some `xdg-open` configurations block
 * until the browser itself exits — a launcher still running after a short
 * grace period is treated as a successful launch rather than awaited.
 */
export const openUrl = (url) => Effect.gen(function* () {
    const [command, args] = process.platform === "win32"
        ? ["rundll32.exe", ["url.dll,FileProtocolHandler", url]]
        : process.platform === "darwin"
            ? ["open", [url]]
            : ["xdg-open", [url]];
    const handle = yield* ChildProcess.make(command, [...args], {
        shell: false,
    });
    const exitCode = yield* handle.exitCode.pipe(Effect.timeoutOption("3 seconds"));
    if (Option.isSome(exitCode) && exitCode.value !== 0) {
        return yield* Effect.fail(new BrowserOpenFailed({ command, exitCode: exitCode.value }));
    }
}).pipe(Effect.scoped);
const makeNonInteractive = (options) => {
    const stdout = options.stdout ?? process.stdout;
    const colors = options.colors ?? colorsEnabled(stdout);
    const glyphs = glyphsFor(options.unicode ?? unicodeEnabled());
    const colorize = (hex, value) => colors ? `${ansiFg(hex)}${value}${ANSI_RESET}` : value;
    const muted = (value) => colors ? `${ANSI_DIM}${value}${ANSI_RESET}` : value;
    // Plain-string equivalent of the CLI's `Status` component: colored glyph,
    // the message (painted for errors), and a muted `· detail` suffix.
    const statusText = (variant, message, detail) => {
        const glyph = colorize(statusColor(variant), glyphs[variant]);
        const body = variant === "error" ? colorize(statusColor(variant), message) : message;
        return `${glyph} ${body}${detail === undefined ? "" : ` ${muted(`· ${detail}`)}`}`;
    };
    const log = (variant) => (message) => Effect.sync(() => {
        const { message: text, detail } = typeof message === "string" ? { message } : message;
        stdout.write(`${statusText(variant, text, detail)}\n`);
    });
    const unavailable = (operation) => Effect.fail(new NonInteractiveTerminal({
        operation,
        message: `Cannot run ${operation} without an interactive terminal. Provide the equivalent command flags instead.`,
    }));
    return {
        output: {
            info: log("info"),
            success: log("success"),
            warning: log("warning"),
            error: log("error"),
        },
        prompt: {
            text: () => unavailable("text input"),
            password: () => unavailable("password input"),
            confirm: () => unavailable("confirmation"),
            select: () => unavailable("selection"),
            multiSelect: () => unavailable("multiple selection"),
            awaitExternal: () => unavailable("external authorization"),
        },
        task: (taskOptions, effect) => Effect.suspend(() => {
            let settled = false;
            const settle = (variant, message) => Effect.suspend(() => {
                if (settled)
                    return Effect.void;
                settled = true;
                return log(variant)(message ?? taskOptions.label);
            });
            return log("info")({
                message: taskOptions.label,
                detail: taskOptions.detail,
            }).pipe(Effect.andThen(effect.pipe(Effect.onExit((exit) => Exit.isSuccess(exit)
                ? settle("success")
                : // Interruption (Ctrl+C) is not a failure — leave the row
                    // unsettled instead of painting a red error status.
                    Cause.hasInterruptsOnly(exit.cause)
                        ? Effect.void
                        : settle("error")))));
        }),
    };
};
/**
 * The default Interaction for processes without a terminal renderer: the
 * programmatic engine API, tests, and any headless embedding. Messages
 * print as plain status lines; every prompt fails immediately with the
 * typed {@link NonInteractiveTerminal}.
 */
export const layerNonInteractive = (options = {}) => Layer.effect(Interaction, Effect.sync(() => makeNonInteractive(options)));
//# sourceMappingURL=Interaction.js.map