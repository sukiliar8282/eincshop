import * as Layer from "effect/Layer";
import { Encrypt } from "./Encrypt.ts";
/**
 * HTTP implementation of {@link Encrypt}. Provide it on the
 * {@link Service} or Action Effect.
 *
 *
 * ### Provide the layer
 * **Example:** On a Service
 * ```typescript
 * Effect.gen(function* () {
 *   const encrypt = yield* Fly.Encrypt(Box);
 *   // ...
 * }).pipe(Effect.provide(Fly.EncryptHttp))
 * ```
 *
 * @layer
 * @provides Fly.Encrypt
 */
export declare const EncryptHttp: Layer.Layer<Encrypt, never, never>;
//# sourceMappingURL=EncryptHttp.d.ts.map