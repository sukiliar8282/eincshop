import * as Layer from "effect/Layer";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Credentials } from "../Credentials.ts";
import { WriteQueue } from "./WriteQueue.ts";
/**
 * Local implementation of the {@link WriteQueue} binding — pushes messages
 * to a Cloudflare Queue over the bulk-push HTTP API using the **current
 * credentials** instead of a native Worker binding
 * ({@link WriteQueueBinding}) or a scoped API token ({@link WriteQueueHttp}).
 *
 * Provide it on an {@link Action} (or any deploy-time Effect) so you can send
 * messages to a queue with the same `send`/`sendBatch` client you'd use inside
 * a Worker — no Worker host and no minted token.
 *
 * @example Seeding a queue from an Action
 * ```typescript
 * const Seed = Alchemy.Action(
 *   "Seed",
 *   Effect.gen(function* () {
 *     const q = yield* Cloudflare.Queues.WriteQueue(queue);
 *     return Effect.fn(function* () {
 *       yield* q.send({ text: "hi", sentAt: Date.now() });
 *       yield* q.sendBatch([{ body: { event: "click", id: 1 } }]);
 *     });
 *   }).pipe(Effect.provide(Cloudflare.Queues.WriteQueueLocal)),
 * );
 * ```
 *
 * The queue id is resolved at apply time through the ambient
 * {@link RuntimeContext} (in an Action, that's the resolve context the engine
 * provides around the body), so `WriteQueue(queue)` works even though the
 * queue is created in the same deploy.
 */
export declare const WriteQueueLocal: Layer.Layer<WriteQueue, never, CloudflareEnvironment | Credentials | HttpClient.HttpClient>;
//# sourceMappingURL=WriteQueueLocal.d.ts.map