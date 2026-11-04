import * as Layer from "effect/Layer";
import { ListSecrets } from "./ListSecrets.ts";
/**
 * HTTP implementation of {@link ListSecrets}. Provide it on the
 * {@link Service} or Action Effect.
 *
 *
 * ### Provide the layer
 * **Example:** On an Action
 * ```typescript
 * Effect.gen(function* () {
 *   const list = yield* Fly.ListSecrets(Site);
 *   // ...
 * }).pipe(Effect.provide(Fly.ListSecretsHttp))
 * ```
 *
 * @layer
 * @provides Fly.ListSecrets
 */
export declare const ListSecretsHttp: Layer.Layer<ListSecrets, never, never>;
//# sourceMappingURL=ListSecretsHttp.d.ts.map