import * as machines from "@distilled.cloud/fly-io/machines";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { CredentialsFromAmbientOrEnv } from "./Credentials.js";
import { bytesToBase64, makeHttpSecretKeyBinding } from "./SecretKeyHttp.js";
import { Verify } from "./Verify.js";
/**
 * HTTP implementation of {@link Verify}. Provide it on the
 * {@link Service} or Action Effect.
 *
 *
 * ### Provide the layer
 * **Example:** On a Service
 * ```typescript
 * Effect.gen(function* () {
 *   const verify = yield* Fly.Verify(Signing);
 *   // ...
 * }).pipe(Effect.provide(Fly.VerifyHttp))
 * ```
 *
 * @layer
 * @provides Fly.Verify
 */
export const VerifyHttp = Layer.effect(Verify, Effect.suspend(() => makeHttpSecretKeyBinding({
    makeClient: (auth, appName, secretName) => Effect.fn("Fly.Verify")(function* (request) {
        // Fly answers 200 only when the signature checks out.
        yield* auth.authorize(machines.verifySecretKey({
            app_name: yield* appName,
            secret_name: yield* secretName,
            plaintext: bytesToBase64(request.plaintext),
            signature: bytesToBase64(request.signature),
        }));
        return { valid: true };
    }),
}))).pipe(Layer.provide(FetchHttpClient.layer), Layer.provide(CredentialsFromAmbientOrEnv));
//# sourceMappingURL=VerifyHttp.js.map