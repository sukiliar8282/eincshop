import * as Effect from "effect/Effect";
export declare const isNonInteractive: () => boolean;
/**
 * Whether a plain line-based prompt can still read an answer from stdin.
 *
 * Distinct from {@link isNonInteractive}: `ALCHEMY_PLAIN` / `ALCHEMY_NO_TUI`
 * turn off the TUI *rendering*, not input — a human running plain mode in a
 * terminal can still answer a `[y/n]` question. Agents and CI pipe stdin
 * (or set their env markers) and land `false`.
 */
export declare const canPromptOnStdin: () => boolean;
export interface InteractionCapabilities {
    readonly input: boolean;
}
/** Process capabilities as an Effect so callers can replace them in tests. */
export declare const processInteractionCapabilities: Effect.Effect<InteractionCapabilities>;
/** Select user-facing copy from an injected capability Effect. */
export declare const messageForCapabilities: <E, R>(capabilities: Effect.Effect<InteractionCapabilities, E, R>, interactive: string, nonInteractive: string) => Effect.Effect<string, E, R>;
/** Prefer the profile dashboard when this process can own a TUI screen. */
export declare const profileCommandHint: (nonInteractiveCommand: string) => Effect.Effect<string, never, never>;
//# sourceMappingURL=interactive.d.ts.map