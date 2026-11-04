import * as queues from "@distilled.cloud/cloudflare/queues";
import * as Layer from "effect/Layer";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { Stack } from "../../Stack.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import { LocalRuntimeState } from "../LocalRuntime.ts";
import type { Providers } from "../Providers.ts";
export declare const isQueue: (value: unknown) => value is Queue;
export type QueueProps = {
    /**
     * Name of the queue. If omitted, a unique name will be generated.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
};
export type Queue = Resource<"Cloudflare.Queues.Queue", QueueProps, {
    queueId: string;
    queueName: string;
    accountId: string;
}, never, Providers>;
/**
 * A Cloudflare Queue for reliable message passing between Workers.
 *
 * Queues enable you to send and receive messages with guaranteed delivery.
 * Create a queue as a resource, then bind it to a Worker to send messages
 * at runtime. Register a consumer to process messages.
 * ### Creating a Queue
 * **Example:** Basic queue
 * ```typescript
 * const queue = yield* Cloudflare.Queues.Queue("MyQueue");
 * ```
 *
 * **Example:** Queue with explicit name
 * ```typescript
 * const queue = yield* Cloudflare.Queues.Queue("MyQueue", {
 *   name: "my-app-queue",
 * });
 * ```
 *
 * ### Binding to a Worker
 * In an Effect-style Worker, use `Cloudflare.Queues.WriteQueue` in
 * the init phase and provide `Cloudflare.Queues.WriteQueueBinding` in
 * the runtime layer. The returned `WriteQueueClient` exposes `send`
 * and `sendBatch`.
 *
 * **Example:** Sending messages from a Worker
 * ```typescript
 * import * as Cloudflare from "alchemy/Cloudflare";
 * import * as Effect from "effect/Effect";
 * import { HttpServerRequest } from "effect/unstable/http/HttpServerRequest";
 * import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
 *
 * export const Queue = Cloudflare.Queues.Queue("Queue");
 *
 * export default Cloudflare.Worker(
 *   "Worker",
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     const queue = yield* Cloudflare.Queues.WriteQueue(Queue);
 *
 *     return {
 *       fetch: Effect.gen(function* () {
 *         const request = yield* HttpServerRequest;
 *         if (request.url === "/queue/send" && request.method === "POST") {
 *           const text = yield* request.text;
 *           yield* queue.send({ text, sentAt: Date.now() }).pipe(Effect.orDie);
 *           return yield* HttpServerResponse.json(
 *             { sent: { text } },
 *             { status: 202 },
 *           );
 *         }
 *         return HttpServerResponse.text("Not Found", { status: 404 });
 *       }),
 *     };
 *   }).pipe(Effect.provide(Cloudflare.Queues.WriteQueueBinding)),
 * );
 * ```
 *
 * @resource
 * @product Queues
 * @category Storage & Databases
 */
export declare const Queue: import("../../Resource.ts").ResourceClass<Queue>;
export declare const ProviderLive: () => Layer.Layer<Provider.Provider<Queue>, never, CloudflareEnvironment | Stack | import("../../Stage.ts").Stage | queues.CloudflareOpContext>;
export declare const ProviderLocal: () => Layer.Layer<Provider.Provider<Queue>, never, import("../../AlchemyContext.ts").AlchemyContext | import("../../Artifacts.ts").ArtifactStore | CloudflareEnvironment | LocalRuntimeState | Stack | import("../../Stage.ts").Stage | queues.CloudflareOpContext>;
export declare const QueueProvider: () => Layer.Layer<Provider.Provider<Queue>, import("effect/Config").ConfigError | import("@alchemy.run/cloudflare-runtime/core").ConfigError | import("effect/PlatformError").PlatformError | import("@alchemy.run/cloudflare-runtime/core").SystemError, import("../../AlchemyContext.ts").AlchemyContext | import("../../Artifacts.ts").ArtifactStore | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | CloudflareEnvironment | import("effect/FileSystem").FileSystem | import("effect/Path").Path | Stack | import("../../Stage.ts").Stage | queues.CloudflareOpContext>;
//# sourceMappingURL=Queue.d.ts.map