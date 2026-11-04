import * as machines from "@distilled.cloud/fly-io/machines";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { CredentialsFromAmbientOrEnv } from "./Credentials.js";
import { makeHttpSecretBinding, unwrapSecretValue, } from "./SecretHttp.js";
import { WriteSecret } from "./WriteSecret.js";
/**
 * HTTP implementation of {@link WriteSecret}. Provide it on the
 * {@link Service} or Action Effect.
 *
 *
 * ### Provide the layer
 * **Example:** On an Action
 * ```typescript
 * Effect.gen(function* () {
 *   const secrets = yield* Fly.WriteSecret(ApiToken);
 *   // ...
 * }).pipe(Effect.provide(Fly.WriteSecretHttp))
 * ```
 *
 * @layer
 * @provides Fly.WriteSecret
 */
export const WriteSecretHttp = Layer.effect(WriteSecret, Effect.suspend(() => makeHttpSecretBinding({
    makeClient: secretWriteClient,
}))).pipe(Layer.provide(FetchHttpClient.layer), Layer.provide(CredentialsFromAmbientOrEnv));
/** Build the write client over an injectable auth and App name. */
export const secretWriteClient = (auth, appName, _secretName) => {
    const authorize = auth.authorize;
    return {
        create: Effect.fn("Fly.Secret.create")(function* (name, value) {
            return yield* authorize(machines.createSecret({
                app_name: yield* appName,
                secret_name: name,
                value: unwrapSecretValue(value),
            }));
        }),
        update: Effect.fn("Fly.Secret.update")(function* (name, value) {
            return yield* authorize(machines.updateSecrets({
                app_name: yield* appName,
                values: { [name]: unwrapSecretValue(value) },
            }));
        }),
        delete: Effect.fn("Fly.Secret.delete")(function* (name) {
            return yield* authorize(machines.deleteSecret({
                app_name: yield* appName,
                secret_name: name,
            }));
        }),
    };
};
//# sourceMappingURL=WriteSecretHttp.js.map