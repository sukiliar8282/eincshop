import { ConfigError } from "@distilled.cloud/core/errors";
import { Credentials } from "@distilled.cloud/neon";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { resolveProviderConfig } from "../Auth/Resolve.js";
import { NEON_AUTH_PROVIDER_NAME, } from "./AuthProvider.js";
export { Credentials } from "@distilled.cloud/neon";
const DEFAULT_BASE_URL = "https://console.neon.tech/api/v2";
export const fromAuthProvider = () => Layer.effect(Credentials, Effect.gen(function* () {
    const { profileName, resolve } = yield* resolveProviderConfig(NEON_AUTH_PROVIDER_NAME);
    return yield* resolve.pipe(Effect.map((creds) => ({
        apiKey: creds.apiKey,
        apiBaseUrl: DEFAULT_BASE_URL,
    })), Effect.mapError((e) => new ConfigError({
        message: `Failed to resolve Neon credentials from ${profileName === undefined ? "the CI environment" : `profile '${profileName}'`}: ${e.message ?? String(e)}`,
    })), Effect.orDie, Effect.cached);
}));
//# sourceMappingURL=Credentials.js.map