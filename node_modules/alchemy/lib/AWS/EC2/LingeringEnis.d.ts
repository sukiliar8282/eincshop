import * as Effect from "effect/Effect";
export interface LingeringEniScope {
    /** ENI filter naming the resource being deleted or detached. */
    readonly name: "subnet-id" | "group-id" | "vpc-id";
    readonly value: string;
}
/**
 * Retry `deleteCall` while it fails with a dependency violation, reaping
 * lingering ENIs between attempts.
 *
 * - Base budget (~12 min) matches the historical subnet schedule: fast
 *   exponential start, capped at 30-second steps.
 * - While the observed blockers include reapable ENIs (attached or just
 *   reaped), the budget extends to ~25 min — Lambda's documented worst-case
 *   ENI release window — because those blockers are guaranteed to clear.
 */
export declare const retryWhileLingeringEnis: <A, E extends {
    _tag: string;
}, R>(deleteCall: Effect.Effect<A, E, R>, options: {
    scope: LingeringEniScope;
    isDependencyViolation: (error: E) => boolean;
    session: {
        note: (note: string) => Effect.Effect<void>;
    };
}) => Effect.Effect<A, E, R | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=LingeringEnis.d.ts.map