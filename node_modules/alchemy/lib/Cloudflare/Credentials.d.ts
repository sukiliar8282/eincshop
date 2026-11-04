import { Credentials, type ResolvedCredentials } from "@distilled.cloud/cloudflare/Credentials";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
export { Credentials, fromEnv } from "@distilled.cloud/cloudflare/Credentials";
declare module "@distilled.cloud/cloudflare/Credentials" {
    interface Credentials {
        readonly kind: "Credentials";
    }
}
/**
 * Memoize a credentials-resolution effect until shortly before the resolved
 * credentials expire — see {@link CredentialsCache.cacheUntilExpiry} for the
 * caching rules. Non-OAuth credentials (API token / global key) never expire
 * and cache forever.
 */
export declare const cacheUntilExpiry: <E>(resolve: Effect.Effect<ResolvedCredentials, E>) => Effect.Effect<Effect.Effect<ResolvedCredentials, E, never>, never, never>;
/**
 * Build a `Credentials` layer that resolves Cloudflare credentials via the
 * Alchemy AuthProvider using the configured profile (defaults to "default",
 * selected by the current Alchemy profile).
 */
export declare const fromAuthProvider: () => Layer.Layer<Credentials, import("../Auth/AuthProvider.ts").AuthError | import("effect/Config").ConfigError | import("../Auth/Profile.ts").MissingProviderConfig | import("effect/PlatformError").PlatformError | import("../Auth/Profile.ts").ProfileError, import("../index.ts").AuthProviders | import("../Auth/Profile.ts").ProfileStore>;
//# sourceMappingURL=Credentials.d.ts.map