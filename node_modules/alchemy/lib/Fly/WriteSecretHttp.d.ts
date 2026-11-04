import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { type SecretAuth } from "./SecretHttp.ts";
import { WriteSecret, type WriteSecretClient } from "./WriteSecret.ts";
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
export declare const WriteSecretHttp: Layer.Layer<WriteSecret, never, never>;
/** Build the write client over an injectable auth and App name. */
export declare const secretWriteClient: (auth: SecretAuth, appName: Effect.Effect<string>, _secretName: Effect.Effect<string>) => WriteSecretClient;
//# sourceMappingURL=WriteSecretHttp.d.ts.map