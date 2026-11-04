import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
/**
 * Refresh expiring credentials this long before they actually expire so that
 * in-flight requests never race the expiry deadline.
 */
export declare const CREDENTIAL_REFRESH_WINDOW: Duration.Duration;
/** Compute how long credentials may remain cached. */
export declare const credentialTimeToLive: (expiresAt: number | undefined, resolvedAt: number) => Duration.Duration;
/**
 * Build a single-entry Effect cache whose TTL is derived from each resolved
 * credential's expiry. Concurrent cache misses share one resolution.
 */
export declare const cacheUntilExpiry: <A, E>(resolve: Effect.Effect<A, E>, expiresAt: (credentials: A) => number | undefined) => Effect.Effect<Effect.Effect<A, E, never>, never, never>;
//# sourceMappingURL=CredentialsCache.d.ts.map