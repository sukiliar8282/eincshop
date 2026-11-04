import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
declare const PredicateFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "PredicateFailed";
} & Readonly<A>;
export declare class PredicateFailed extends PredicateFailed_base<{
    message: string;
    actual: unknown;
}> {
}
export declare const isPredicateFailed: (e: unknown) => e is PredicateFailed;
/**
 * Retries an effect until a predicate is met.
 * @param input - The input to the poll function.
 * @param input.description - The description of what is being polled; used in the error message if the predicate fails.
 * @param input.effect - The effect to execute until the predicate is met.
 * @param input.predicate - The predicate to check if the effect has met the desired state.
 * @param input.schedule - The schedule to use for retries; defaults to every 3 seconds.
 * @param input.times - The maximum number of times to poll; defaults to 50.
 * @returns The value that satisfies the predicate.
 */
export declare const poll: <A, E, R>(input: {
    description?: string;
    effect: Effect.Effect<A, E, R>;
    predicate: (value: A) => boolean;
    schedule?: Schedule.Schedule<unknown, unknown, never>;
}) => Effect.Effect<A, E | PredicateFailed, R>;
export {};
//# sourceMappingURL=poll.d.ts.map