import * as Layer from "effect/Layer";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Credentials } from "../Credentials.ts";
import { ReadFlags } from "./ReadFlags.ts";
/**
 * Local implementation of the {@link ReadFlags} binding — evaluates Flagship
 * feature flags over the Cloudflare HTTP API (`GET .../flagship/apps/{appId}/evaluate`)
 * using the **current credentials** instead of a native Worker binding
 * ({@link ReadFlagsBinding}).
 *
 * Provide it on an {@link Action} (or any deploy-time Effect) so you can read
 * flag values with the same `getBooleanValue`/`getStringValue`/… client you'd
 * use inside a Worker:
 *
 * @example Reading a flag from an Action
 * ```typescript
 * const CheckFlag = Alchemy.Action(
 *   "CheckFlag",
 *   Effect.gen(function* () {
 *     const flags = yield* Cloudflare.Flagship.ReadFlags(app);
 *     return Effect.fn(function* () {
 *       return yield* flags.getBooleanValue("new-checkout", false);
 *     });
 *   }).pipe(Effect.provide(Cloudflare.Flagship.ReadFlagsLocal)),
 * );
 * ```
 *
 * The app id is resolved at apply time through the ambient {@link RuntimeContext}
 * (in an Action, that's the resolve context the engine provides around the
 * body), so `ReadFlags(app)` works even though the app is created in the same
 * deploy.
 *
 * Limitations vs. the Worker binding: the HTTP evaluate endpoint only accepts a
 * single `targetingKey` (read from `context.targetingKey`), so attribute-based
 * targeting rules that key off other context fields cannot be exercised locally.
 * The `raw` runtime binding has no HTTP equivalent and dies if used — see
 * {@link makeHttpFlagshipClient}.
 */
export declare const ReadFlagsLocal: Layer.Layer<ReadFlags, never, CloudflareEnvironment | Credentials | HttpClient.HttpClient>;
//# sourceMappingURL=ReadFlagsLocal.d.ts.map