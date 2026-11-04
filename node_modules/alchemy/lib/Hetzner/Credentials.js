import { ConfigError } from "@distilled.cloud/core/errors";
import { Credentials } from "@distilled.cloud/hetzner";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { resolveProviderConfig } from "../Auth/Resolve.js";
import { HETZNER_AUTH_PROVIDER_NAME, } from "./AuthProvider.js";
export { Credentials, CredentialsFromEnv, credentials, DEFAULT_API_BASE_URL, } from "@distilled.cloud/hetzner";
/**
 * Build a `Credentials` layer that resolves Hetzner credentials via the
 * Alchemy AuthProvider using the configured profile (defaults to "default",
 * overridable with the `ALCHEMY_PROFILE` env/config value).
 *
 * Maps onto `@distilled.cloud/hetzner`'s `{ token, apiBaseUrl }` shape.
 */
export const fromAuthProvider = () => Layer.effect(Credentials, Effect.gen(function* () {
    const { profileName, resolve } = yield* resolveProviderConfig(HETZNER_AUTH_PROVIDER_NAME);
    return yield* resolve.pipe(Effect.map((creds) => ({
        token: creds.token,
        apiBaseUrl: creds.apiBaseUrl,
    })), Effect.mapError((e) => new ConfigError({
        message: `Failed to resolve Hetzner credentials from ${profileName === undefined ? "the CI environment" : `profile '${profileName}'`}: ${e.message ?? String(e)}`,
    })), Effect.orDie, Effect.cached);
}));
//# sourceMappingURL=Credentials.js.map