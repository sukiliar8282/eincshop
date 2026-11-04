import { Credentials } from "@distilled.cloud/axiom/Credentials";
import * as Layer from "effect/Layer";
export { Credentials, CredentialsFromEnv, DEFAULT_API_BASE_URL, } from "@distilled.cloud/axiom/Credentials";
/**
 * Build a `Credentials` layer that resolves Axiom credentials via the Alchemy
 * AuthProvider using the configured profile (defaults to "default", overridable
 * with the current Alchemy profile).
 */
export declare const fromAuthProvider: () => Layer.Layer<Credentials, import("../Auth/AuthProvider.ts").AuthError | import("effect/Config").ConfigError | import("../Auth/Profile.ts").MissingProviderConfig | import("effect/PlatformError").PlatformError | import("../Auth/Profile.ts").ProfileError, import("../index.ts").AuthProviders | import("../Auth/Profile.ts").ProfileStore>;
//# sourceMappingURL=Credentials.d.ts.map