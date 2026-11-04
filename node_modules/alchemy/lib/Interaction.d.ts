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
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { UserFacingError } from "./UserFacingError.ts";
declare const TerminalCancelled_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => Cause.YieldableError & {
    readonly _tag: "TerminalCancelled";
} & Readonly<A>;
/** The user dismissed the active terminal interaction. */
export declare class TerminalCancelled extends TerminalCancelled_base {
}
declare const NonInteractiveTerminal_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => Cause.YieldableError & {
    readonly _tag: "NonInteractiveTerminal";
} & Readonly<A>;
/** An interactive operation was requested without an interactive terminal. */
export declare class NonInteractiveTerminal extends NonInteractiveTerminal_base<{
    readonly operation: string;
    readonly message: string;
}> {
    readonly [UserFacingError] = true;
}
declare const BrowserOpenFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => Cause.YieldableError & {
    readonly _tag: "BrowserOpenFailed";
} & Readonly<A>;
/** The platform's browser launcher exited unsuccessfully. */
export declare class BrowserOpenFailed extends BrowserOpenFailed_base<{
    readonly command: string;
    readonly exitCode: number;
}> {
}
export type InteractionError = TerminalCancelled | NonInteractiveTerminal;
export interface MessageOptions {
    readonly message: string;
    readonly detail?: string;
}
export interface TextInputOptions {
    readonly message: string;
    /** Secondary guidance rendered beneath the field in muted text. */
    readonly description?: string;
    /** Place the editable field beside the message or beneath it. @default "inline" */
    readonly layout?: "inline" | "stacked";
    readonly placeholder?: string;
    readonly initialValue?: string;
    readonly defaultValue?: string;
    readonly validate?: (value: string) => string | Error | undefined;
}
export interface PasswordInputOptions extends Omit<TextInputOptions, "initialValue" | "defaultValue"> {
}
export interface ConfirmOptions {
    readonly message: string;
    readonly initialValue?: boolean;
    readonly confirmLabel?: string;
    readonly cancelLabel?: string;
}
export interface Choice<Value> {
    readonly value: Value;
    readonly label: string;
    /** Optional section heading shared by adjacent choices. */
    readonly group?: string;
    /** Indent the entire rendered row, including its selection indicator. */
    readonly indent?: number;
    /** Keep this row visible as the heading for following rows while scrolling. */
    readonly sticky?: boolean;
    /** Visually distinguish structural rows from ordinary choices. */
    readonly tone?: "info";
    readonly description?: string;
    readonly disabled?: boolean | string;
}
export interface SelectOptions<Value> {
    readonly message: string;
    readonly options: ReadonlyArray<Choice<Value>>;
    readonly initialValue?: Value;
    readonly visibleCount?: number;
    /** Allow typing to filter choices by label and description. */
    readonly searchable?: boolean;
    /** Place descriptions beside labels instead of on a second line. */
    readonly descriptionPlacement?: "below" | "inline";
}
export interface MultiSelectOptions<Value> extends Omit<SelectOptions<Value>, "initialValue"> {
    readonly initialValues?: ReadonlyArray<Value>;
    readonly required?: boolean;
}
export interface AwaitExternalOptions {
    readonly message: string;
    readonly waitingLabel: string;
    readonly url?: string;
    /** Short code the user must enter on the authorization page. */
    readonly code?: string;
    readonly openFailed?: boolean;
    /** Open the authorization URL again from the waiting screen. */
    readonly onOpen?: () => Promise<void>;
    /** Allow Enter to switch to manual code entry. @default true */
    readonly allowManualInput?: boolean;
    readonly inputLabel?: string;
    readonly placeholder?: string;
    readonly validate?: (value: string) => string | Error | undefined;
}
export interface ProgressOptions {
    readonly label: string;
    readonly detail?: string;
    /** Terminal window title while this progress view is active. */
    readonly title?: string;
    /** Animate the leading status glyph. @default true */
    readonly spinning?: boolean;
}
declare const Interaction_base: Context.ServiceClass<Interaction, "Alchemy::Interaction", {
    readonly output: {
        readonly info: (message: string | MessageOptions) => Effect.Effect<void>;
        readonly success: (message: string | MessageOptions) => Effect.Effect<void>;
        readonly warning: (message: string | MessageOptions) => Effect.Effect<void>;
        readonly error: (message: string | MessageOptions) => Effect.Effect<void>;
    };
    readonly prompt: {
        readonly text: (options: TextInputOptions) => Effect.Effect<string, InteractionError>;
        readonly password: (options: PasswordInputOptions) => Effect.Effect<string, InteractionError>;
        readonly confirm: (options: ConfirmOptions) => Effect.Effect<boolean, InteractionError>;
        readonly select: <Value>(options: SelectOptions<Value>) => Effect.Effect<Value, InteractionError>;
        readonly multiSelect: <Value>(options: MultiSelectOptions<Value>) => Effect.Effect<ReadonlyArray<Value>, InteractionError>;
        readonly awaitExternal: (options: AwaitExternalOptions) => Effect.Effect<string, InteractionError>;
    };
    /** Run work behind a progress row and collapse it to a final status line. */
    readonly task: <A, E, R>(options: ProgressOptions, effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
}>;
/**
 * The capability to ask or tell the human driving this process. Provided
 * by the CLI (terminal-backed) or {@link layerNonInteractive} (plain
 * output, typed prompt failures); never provided in child processes.
 */
export declare class Interaction extends Interaction_base {
}
/** Effectful service accessors for code that must defer acquisition to use time. */
export declare const accessors: {
    output: {
        info: (message: string | MessageOptions) => Effect.Effect<void, never, Interaction>;
        success: (message: string | MessageOptions) => Effect.Effect<void, never, Interaction>;
        warning: (message: string | MessageOptions) => Effect.Effect<void, never, Interaction>;
        error: (message: string | MessageOptions) => Effect.Effect<void, never, Interaction>;
    };
    prompt: {
        text: (options: TextInputOptions) => Effect.Effect<string, InteractionError, Interaction>;
        password: (options: PasswordInputOptions) => Effect.Effect<string, InteractionError, Interaction>;
        confirm: (options: ConfirmOptions) => Effect.Effect<boolean, InteractionError, Interaction>;
        select: <Value>(options: SelectOptions<Value>) => Effect.Effect<Value, InteractionError, Interaction>;
        multiSelect: <Value>(options: MultiSelectOptions<Value>) => Effect.Effect<readonly Value[], InteractionError, Interaction>;
    };
};
/**
 * Open a URL in the platform's default browser without invoking a shell.
 *
 * Fails with {@link BrowserOpenFailed} when the launcher exits non-zero (e.g.
 * `xdg-open` with no handler installed). Some `xdg-open` configurations block
 * until the browser itself exits — a launcher still running after a short
 * grace period is treated as a successful launch rather than awaited.
 */
export declare const openUrl: (url: string) => Effect.Effect<undefined, BrowserOpenFailed | import("effect/PlatformError").PlatformError, import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner>;
export interface NonInteractiveOptions {
    readonly stdout?: NodeJS.WriteStream;
    readonly colors?: boolean;
    readonly unicode?: boolean;
}
/**
 * The default Interaction for processes without a terminal renderer: the
 * programmatic engine API, tests, and any headless embedding. Messages
 * print as plain status lines; every prompt fails immediately with the
 * typed {@link NonInteractiveTerminal}.
 */
export declare const layerNonInteractive: (options?: NonInteractiveOptions) => Layer.Layer<Interaction, never, never>;
export {};
//# sourceMappingURL=Interaction.d.ts.map