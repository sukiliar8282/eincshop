import { Credentials } from "@distilled.cloud/fly-io";
import * as Layer from "effect/Layer";
export { Credentials, CredentialsFromEnv, credentials, DEFAULT_API_BASE_URL, normalizeApiBaseUrl, type Config as CredentialsConfig, } from "@distilled.cloud/fly-io";
/**
 * `Credentials` for the HTTP binding layers (`GetSecretHttp`, `ExecHttp`, …).
 *
 * Those layers are built in two places. Inside a stack (plan/deploy, or an
 * Action) `providers()` has already resolved the profile-backed
 * `Credentials`, and the binding must use them — a laptop deploy has no
 * `FLY_API_TOKEN` in its env once the token lives in the Alchemy profile.
 * Inside a deployed Machine there is no profile; the host injected
 * `FLY_API_TOKEN` into the process env (see `SecretHttp.ts`). So: reuse the
 * ambient `Credentials` when present, otherwise read the env.
 */
export declare const CredentialsFromAmbientOrEnv: Layer.Layer<Credentials>;
/**
 * Build a `Credentials` layer that resolves Fly credentials via the current
 * Alchemy profile, or directly from environment variables in CI.
 *
 * Maps onto `@distilled.cloud/fly-io`'s `{ apiKey, apiBaseUrl }` shape.
 * Distilled's own `CredentialsFromEnv` also accepts `FLY_IO_API_KEY` as a
 * fallback — Alchemy itself only reads `FLY_API_TOKEN`.
 */
export declare const fromAuthProvider: () => Layer.Layer<Credentials, import("../Auth/AuthProvider.ts").AuthError | import("effect/Config").ConfigError | import("../Auth/Profile.ts").MissingProviderConfig | import("effect/PlatformError").PlatformError | import("../Auth/Profile.ts").ProfileError, import("../index.ts").AuthProviders | import("../Auth/Profile.ts").ProfileStore>;
//# sourceMappingURL=Credentials.d.ts.map