import { Credentials } from "@distilled.cloud/railway";
import * as Layer from "effect/Layer";
export { Credentials, CredentialsFromEnv, CredentialsFromToken, DEFAULT_API_BASE_URL, type Config as CredentialsConfig, type TokenKind, } from "@distilled.cloud/railway";
/**
 * Build a `Credentials` layer that resolves Railway credentials via the
 * current Alchemy profile, or directly from environment variables in CI.
 *
 * Maps onto `@distilled.cloud/railway`'s
 * `{ token, tokenKind: "account", apiBaseUrl }` shape. Alchemy itself only
 * reads `RAILWAY_API_TOKEN` (account Bearer). Distilled's own
 * `CredentialsFromEnv` also accepts `RAILWAY_TOKEN` / `RAILWAY_PROJECT_TOKEN`
 * as fallbacks.
 */
export declare const fromAuthProvider: () => Layer.Layer<Credentials, import("../Auth/AuthProvider.ts").AuthError | import("effect/Config").ConfigError | import("../Auth/Profile.ts").MissingProviderConfig | import("effect/PlatformError").PlatformError | import("../Auth/Profile.ts").ProfileError, import("../index.ts").AuthProviders | import("../Auth/Profile.ts").ProfileStore>;
//# sourceMappingURL=Credentials.d.ts.map