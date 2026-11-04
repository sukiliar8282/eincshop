import * as Layer from "effect/Layer";
import { Decrypt } from "./Decrypt.ts";
/**
 * HTTP implementation of {@link Decrypt}. Provide it on the
 * {@link Service} or Action Effect.
 *
 *
 * ### Provide the layer
 * **Example:** On a Service
 * ```typescript
 * Effect.gen(function* () {
 *   const decrypt = yield* Fly.Decrypt(Box);
 *   // ...
 * }).pipe(Effect.provide(Fly.DecryptHttp))
 * ```
 *
 * @layer
 * @provides Fly.Decrypt
 */
export declare const DecryptHttp: Layer.Layer<Decrypt, never, never>;
//# sourceMappingURL=DecryptHttp.d.ts.map