import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
/**
 * The one ambient progress channel. Everything long-running — the planner's
 * phase/node events, state-store bootstrap, nuke scans and deletions,
 * provider configure/refresh — reports through it. Defaults to a no-op, so
 * a caller that only wants the result provides nothing; a renderer provides
 * its own handler for the events it wants to observe.
 */
export const Progress = Context.Reference("alchemy/Progress", { defaultValue: () => () => Effect.void });
/** A session that drops everything — the default when no renderer is ambient. */
export const noopSession = {
    emit: () => Effect.void,
    done: () => Effect.void,
};
export class Cli extends Context.Service()("CLI") {
}
//# sourceMappingURL=Report.js.map