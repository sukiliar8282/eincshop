import * as Effect from "effect/Effect";
export declare const devKeepAlive: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
declare const makeExec: () => Effect.Effect<void, unknown, never>;
/** Fully wired sidecar CLI program. */
export declare const exec: () => Effect.Effect<void, Effect.Error<ReturnType<typeof makeExec>>>;
export {};
//# sourceMappingURL=exec.d.ts.map