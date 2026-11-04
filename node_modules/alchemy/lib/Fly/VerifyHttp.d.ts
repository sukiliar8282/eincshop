import * as Layer from "effect/Layer";
import { Verify } from "./Verify.ts";
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
export declare const VerifyHttp: Layer.Layer<Verify, never, never>;
//# sourceMappingURL=VerifyHttp.d.ts.map