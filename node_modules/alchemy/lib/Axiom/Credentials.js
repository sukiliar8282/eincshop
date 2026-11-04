import { Credentials } from "@distilled.cloud/axiom/Credentials";
import { ConfigError } from "@distilled.cloud/core/errors";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";
import { resolveProviderConfig } from "../Auth/Resolve.js";
import { AXIOM_AUTH_PROVIDER_NAME, } from "./AuthProvider.js";
export { Credentials, CredentialsFromEnv, DEFAULT_API_BASE_URL, } from "@distilled.cloud/axiom/Credentials";
/**
 * Build a `Credentials` layer that resolves Axiom credentials via the Alchemy
 * AuthProvider using the configured profile (defaults to "default", overridable
 * with the current Alchemy profile).
 */
export const fromAuthProvider = () => Layer.effect(Credentials, Effect.gen(function* () {
    const { profileName, resolve } = yield* resolveProviderConfig(AXIOM_AUTH_PROVIDER_NAME);
    return yield* resolve.pipe(Effect.map((creds) => Match.value(creds).pipe(Match.when({ type: "apiToken" }, (c) => ({
        apiKey: c.apiToken,
        apiBaseUrl: c.apiBaseUrl,
        orgId: c.orgId,
    })), Match.when({ type: "pat" }, (c) => ({
        apiKey: c.apiToken,
        apiBaseUrl: c.apiBaseUrl,
        orgId: c.orgId,
    })), Match.exhaustive)), Effect.mapError((e) => new ConfigError({
        message: `Failed to resolve Axiom credentials from ${profileName === undefined ? "the CI environment" : `profile '${profileName}'`}: ${e.message ?? String(e)}`,
    })), Effect.orDie, Effect.cached);
}));
//# sourceMappingURL=Credentials.js.map