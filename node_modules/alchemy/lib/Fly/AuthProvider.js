import { DEFAULT_API_BASE_URL, normalizeApiBaseUrl, } from "@distilled.cloud/fly-io";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import { getEnv, getEnvRedactedRequired } from "../Auth/Env.js";
import { makeStoredAuthProvider, storedSecret, storedValueText, } from "../Auth/StoredAuthProvider.js";
export const FLY_AUTH_PROVIDER_NAME = "Fly";
export const FLY_API_TOKEN_ENV = "FLY_API_TOKEN";
export const FLY_API_HOSTNAME_ENV = "FLY_API_HOSTNAME";
const resolveApiBaseUrl = (explicit) => getEnv(FLY_API_HOSTNAME_ENV).pipe(Effect.map((fromEnv) => normalizeApiBaseUrl(explicit ?? fromEnv)));
const flyAuth = makeStoredAuthProvider({
    provider: FLY_AUTH_PROVIDER_NAME,
    fields: [
        { name: "apiKey", label: "Fly.io API Token", secret: true },
        {
            name: "apiBaseUrl",
            label: "Fly API hostname",
            placeholder: DEFAULT_API_BASE_URL,
            optional: true,
        },
    ],
    toResolved: (values) => ({
        type: "token",
        apiKey: storedSecret(values.apiKey) ?? Redacted.make(""),
        apiBaseUrl: normalizeApiBaseUrl(storedValueText(values.apiBaseUrl)),
        source: { type: "stored" },
    }),
    readEnvironment: Effect.gen(function* () {
        const apiKey = yield* getEnvRedactedRequired(FLY_API_TOKEN_ENV);
        const apiBaseUrl = yield* resolveApiBaseUrl();
        return {
            type: "token",
            apiKey,
            apiBaseUrl,
            source: { type: "env", details: FLY_API_TOKEN_ENV },
        };
    }),
    environment: [
        { name: FLY_API_TOKEN_ENV, required: true, secret: true },
        { name: FLY_API_HOSTNAME_ENV, required: false },
    ],
});
/**
 * Layer that registers the Fly {@link AuthProvider} into the
 * {@link AuthProviders} registry. Fly uses a stored API token locally and
 * `FLY_API_TOKEN` in CI; `FLY_API_HOSTNAME` optionally overrides the API root.
 */
export const FlyAuth = flyAuth.layer;
//# sourceMappingURL=AuthProvider.js.map