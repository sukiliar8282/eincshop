import { Credentials } from "@distilled.cloud/planetscale/Credentials";
import * as Config from "effect/Config";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
export { Credentials, CredentialsFromEnv, DEFAULT_API_BASE_URL, } from "@distilled.cloud/planetscale/Credentials";
/**
 * Build a PlanetScale `Credentials` Layer from an explicit token. Useful for
 * tests or when the caller already has credentials in hand.
 *
 * @example
 * ```ts
 * Effect.provide(
 *   Planetscale.fromToken({
 *     tokenId: "abcd1234",
 *     token: "api-token-secret",
 *     organization: "my-org",
 *   }),
 * )
 * ```
 */
export declare const fromToken: (input: {
    tokenId: string | Redacted.Redacted<string>;
    token: string | Redacted.Redacted<string>;
    organization: string;
    apiBaseUrl?: string;
}) => Layer.Layer<Credentials, never, never>;
/**
 * Build a PlanetScale `Credentials` Layer that resolves credentials via the
 * Alchemy AuthProvider using the configured profile (defaults to "default",
 * selected by the current Alchemy profile).
 */
export declare const fromAuthProvider: () => Layer.Layer<Credentials, import("../Auth/AuthProvider.ts").AuthError | Config.ConfigError | import("../Auth/Profile.ts").MissingProviderConfig | import("effect/PlatformError").PlatformError | import("../Auth/Profile.ts").ProfileError, import("../index.ts").AuthProviders | import("../Auth/Profile.ts").ProfileStore>;
//# sourceMappingURL=Credentials.d.ts.map