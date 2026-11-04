import * as Effect from "effect/Effect";
/**
 * Shared Amazon Macie provider scaffolding. NOT exported from `index.ts`.
 */
/**
 * Macie enablement is eventually consistent — resource creation can briefly
 * reject with the synthetic `MacieNotEnabled` tag right after the session is
 * enabled. Retry on a bounded schedule (< 30s total). The explicit
 * `Effect.Effect<A, E, R>` return annotation keeps `Retry.Return`'s
 * conditional type out of declaration emit, which would otherwise widen the
 * provider layer's `R` to `unknown` and poison every consumer of
 * `AWS.providers()`.
 */
export declare const retryThroughEnablement: <A, E extends {
    _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
//# sourceMappingURL=common.d.ts.map