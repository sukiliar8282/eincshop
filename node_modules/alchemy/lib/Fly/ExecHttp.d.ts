import * as Layer from "effect/Layer";
import { Exec } from "./Exec.ts";
/**
 * HTTP implementation of {@link Exec}. Provide it on the
 * {@link Sprite}, {@link Service}, or Action Effect.
 *
 *
 * ### Provide the layer
 * **Example:** On a Sprite
 * ```typescript
 * Effect.gen(function* () {
 *   const exec = yield* Fly.Exec(Box);
 *   // ...
 * }).pipe(Effect.provide(Fly.ExecHttp))
 * ```
 *
 * @layer
 * @provides Fly.Exec
 */
export declare const ExecHttp: Layer.Layer<Exec, never, never>;
//# sourceMappingURL=ExecHttp.d.ts.map