import * as Layer from "effect/Layer";
import { Checkpoint } from "./Checkpoint.ts";
/**
 * HTTP implementation of {@link Checkpoint}. Provide it on the
 * {@link Sprite}, {@link Service}, or Action Effect.
 *
 *
 * ### Provide the layer
 * **Example:** On a Sprite
 * ```typescript
 * Effect.gen(function* () {
 *   const checkpoint = yield* Fly.Checkpoint(Box);
 *   // ...
 * }).pipe(Effect.provide(Fly.CheckpointHttp))
 * ```
 *
 * @layer
 * @provides Fly.Checkpoint
 */
export declare const CheckpointHttp: Layer.Layer<Checkpoint, never, never>;
//# sourceMappingURL=CheckpointHttp.d.ts.map