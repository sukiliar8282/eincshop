import * as Effect from "effect/Effect";
import * as Runtime from "effect/Runtime";
import * as CliKit from "../CliKit/index.ts";
declare const ConfirmationDeclined_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ConfirmationDeclined";
} & Readonly<A>;
/**
 * A declined confirmation prompt. By the time this propagates the decline
 * message has already been printed and the exit code set, so the
 * `[Runtime.errorReported] = false` marker suppresses the runtime's default
 * failure log — the process just exits 1, matching the CLI's documented
 * "1 = failure or decline" contract.
 */
export declare class ConfirmationDeclined extends ConfirmationDeclined_base {
    readonly [Runtime.errorReported] = false;
}
/**
 * Gate a destructive operation behind a confirmation prompt.
 *
 * Returns void when `yes` was passed or the user approves. Otherwise prints
 * `abortMessage` (default "Aborted."), sets the exit code to 1 via
 * {@link exitDeclined}, and fails with {@link ConfirmationDeclined} so the
 * command short-circuits before the destructive work.
 */
export declare const confirmOrDecline: (options: {
    readonly yes: boolean;
    readonly message: string;
    readonly confirmLabel?: string;
    readonly cancelLabel?: string;
    readonly abortMessage?: string;
}) => Effect.Effect<undefined, ConfirmationDeclined | CliKit.InteractionError, CliKit.CliKit>;
export {};
//# sourceMappingURL=confirm.d.ts.map