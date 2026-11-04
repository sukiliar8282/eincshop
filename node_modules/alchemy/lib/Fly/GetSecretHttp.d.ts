import * as Layer from "effect/Layer";
import { GetSecret } from "./GetSecret.ts";
/**
 * HTTP implementation of {@link GetSecret}. Provide it on the
 * {@link Service} or Action Effect.
 *
 *
 * ### Provide the layer
 * **Example:** On a Service
 * ```typescript
 * Effect.gen(function* () {
 *   const get = yield* Fly.GetSecret(ApiToken);
 *   // ...
 * }).pipe(Effect.provide(Fly.GetSecretHttp))
 * ```
 *
 * @layer
 * @provides Fly.GetSecret
 */
export declare const GetSecretHttp: Layer.Layer<GetSecret, never, never>;
//# sourceMappingURL=GetSecretHttp.d.ts.map