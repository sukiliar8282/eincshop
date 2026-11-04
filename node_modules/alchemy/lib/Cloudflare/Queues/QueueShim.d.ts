/**
 * Dev-mode remote-producer shim for `Alchemy.remote()` queues.
 *
 * Cloudflare's preview/remote-binding sessions reject queue bindings
 * outright (a preview worker carrying one serves 503 for every request;
 * wrangler has the same gap — cloudflare/workers-sdk#9929), so a locally
 * running worker cannot produce to a live queue through the usual
 * remote-binding proxy. Instead, alchemy deploys a REAL shim worker that
 * holds the actual queue binding:
 *
 *   local worker ── env.QUEUE.send() ──▶ forwarder service (local workerd)
 *        POST /message | /batch  +  Authorization: Bearer <token>
 *                                   │
 *                                   ▼
 *                     deployed shim worker (workers.dev)
 *                                   │  env.QUEUE.send(body, { contentType })
 *                                   ▼
 *                            real Cloudflare Queue
 *
 * The shim and its bearer token are ordinary engine-managed resources
 * ({@link Worker} + {@link Random}), conditionally instantiated at eval
 * time when a LOCAL worker binds a LIVE queue — the same idiom as
 * `AccountApiToken` (capability layers minting token resources) and
 * event-source mappings. The engine gives the full lifecycle for free:
 * Output-based ordering (shim deploys before the local worker serves),
 * stable-name updates, deletion on destroy, and orphan GC on promotion
 * (`alchemy deploy` no longer registers the shim, so it is cleaned up).
 *
 * NOT exported from `index.ts` — binding-internal scaffolding.
 */
import * as Effect from "effect/Effect";
import type * as Redacted from "effect/Redacted";
import type * as Output from "../../Output.ts";
import { type ProviderMode } from "../../ProviderMode.ts";
import { Random } from "../../Random.ts";
import type { Queue } from "./Queue.ts";
export interface QueueShimBinding {
    url: Output.Output<string | undefined>;
    token: Output.Output<Redacted.Redacted<string>>;
}
/**
 * Conditionally instantiate the queue shim for a producer binding: when a
 * LOCAL host worker binds a LIVE queue (dev run + `Alchemy.remote()` on the
 * queue), register the shim worker + its token and return their outputs
 * for the binding data. Any other mode combination returns `undefined` —
 * including the shim worker's own eval of its queue binding (the shim is
 * pinned live, so no recursion).
 */
export declare const maybeQueueShim: (queue: Queue, host: {
    Mode?: ProviderMode | undefined;
}) => Effect.Effect<{
    url: Output.Output<string | undefined, never>;
    token: Output.ObjectExpr<Redacted.Redacted<string>, never>;
} | undefined, never, import("../../Provider.ts").Provider<Random> | import("../Providers.ts").Providers>;
//# sourceMappingURL=QueueShim.d.ts.map