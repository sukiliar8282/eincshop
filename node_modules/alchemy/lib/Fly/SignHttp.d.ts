import * as Layer from "effect/Layer";
import { Sign } from "./Sign.ts";
/**
 * HTTP implementation of {@link Sign}. Provide it on the
 * {@link Service} or Action Effect.
 *
 *
 * ### Provide the layer
 * **Example:** On a Service
 * ```typescript
 * Effect.gen(function* () {
 *   const sign = yield* Fly.Sign(Signing);
 *   // ...
 * }).pipe(Effect.provide(Fly.SignHttp))
 * ```
 *
 * @layer
 * @provides Fly.Sign
 */
export declare const SignHttp: Layer.Layer<Sign, never, never>;
//# sourceMappingURL=SignHttp.d.ts.map