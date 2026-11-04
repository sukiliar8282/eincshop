import * as queues from "@distilled.cloud/cloudflare/queues";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { Stack } from "../../Stack.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import { LocalRuntimeState } from "../LocalRuntime.ts";
import type { Providers } from "../Providers.ts";
export type ConsumerProps = {
    /**
     * The queue ID to attach the consumer to.
     */
    queueId: string;
    /**
     * Name of the Worker script that will consume messages.
     */
    scriptName: string;
    /**
     * Optional dead letter queue name for failed messages.
     */
    deadLetterQueue?: string;
    /**
     * Consumer settings.
     */
    settings?: ConsumerSettings;
};
export interface ConsumerSettings {
    /**
     * The maximum number of messages per batch.
     * @default 10
     */
    batchSize?: number;
    /**
     * The maximum number of concurrent consumer invocations.
     */
    maxConcurrency?: number;
    /**
     * The maximum number of retries for a message.
     * @default 3
     */
    maxRetries?: number;
    /**
     * The maximum time to wait for a batch to fill, in milliseconds.
     * @default 5000
     */
    maxWaitTimeMs?: number;
    /**
     * The number of seconds to wait before retrying a message.
     */
    retryDelay?: number;
}
export type Consumer = Resource<"Cloudflare.Queues.Consumer", ConsumerProps, {
    consumerId: string;
    queueId: string;
    scriptName: string;
    accountId: string;
    deadLetterQueue?: string;
    settings?: ConsumerSettings;
    /**
     * Dev only, live queues only: the real queue's name, resolved from the
     * cloud so the local runtime can wire the broker + pull loop for a
     * locally-running consumer of an `Alchemy.remote()` queue.
     */
    queueName?: string;
    /**
     * Dev only, live queues only: id of the `http_pull` consumer attached
     * to the real queue so the local runtime can drain it via the HTTP
     * pull API. Deleted when this resource is deleted.
     */
    pullConsumerId?: string;
}, never, Providers>;
/**
 * A Cloudflare Queue Consumer that processes messages from a Queue.
 *
 * Register a Worker as a consumer of a Queue. The Worker's `queue()`
 * handler will be invoked with batches of messages.
 *
 * Cloudflare allows at most one Worker consumer per queue (HTTP-pull
 * consumers can coexist). The reconciler enforces this: if the queue
 * already has a Worker consumer pointing at a different logical Worker's
 * script, the deploy fails with a clear error rather than silently
 * adopting it. A stranded consumer from a prior generation of the *same*
 * Worker (identified by the scripts' ownership tags) is rebuilt in place.
 * ### Registering a Consumer
 * **Example:** Basic consumer
 * ```typescript
 * const queue = yield* Cloudflare.Queues.Queue("MyQueue");
 * const worker = yield* Cloudflare.Worker("Worker", { ... });
 *
 * yield* Cloudflare.Queues.Consumer("MyConsumer", {
 *   queueId: queue.queueId,
 *   scriptName: worker.workerName,
 * });
 * ```
 *
 * **Example:** Consumer with settings
 * ```typescript
 * yield* Cloudflare.Queues.Consumer("MyConsumer", {
 *   queueId: queue.queueId,
 *   scriptName: worker.workerName,
 *   settings: {
 *     batchSize: 50,
 *     maxRetries: 5,
 *     maxWaitTimeMs: 10000,
 *   },
 * });
 * ```
 *
 * @resource
 * @product Queues
 * @category Storage & Databases
 */
export declare const Consumer: import("../../Resource.ts").ResourceClass<Consumer>;
/**
 * Find and detach every worker queue-consumer pointing at `scriptName`.
 * Queue consumers have no by-script lookup, so scan the account's queues
 * (the list response inlines each queue's consumers). Waits until each
 * detach propagates to the workers subsystem so a follow-up deleteScript
 * doesn't re-race the conflict.
 *
 * Shared by the Worker provider's script delete (QueueConsumerConflict
 * recovery) and the Queue provider's orphaned-script cleanup.
 *
 * @internal
 */
export declare const detachQueueConsumersOfScript: (accountId: string, scriptName: string) => Effect.Effect<void, queues.InvalidRequestBody | queues.InvalidRoute | queues.CloudflareOpError, queues.CloudflareOpContext>;
export declare const ConsumerProviderLive: () => Layer.Layer<Provider.Provider<Consumer>, never, CloudflareEnvironment | Stack | queues.CloudflareOpContext>;
export declare const ConsumerProviderLocal: () => Layer.Layer<Provider.Provider<Consumer>, never, import("../../AlchemyContext.ts").AlchemyContext | import("../../Artifacts.ts").ArtifactStore | CloudflareEnvironment | LocalRuntimeState | Stack | queues.CloudflareOpContext>;
export declare const ConsumerProvider: () => Layer.Layer<Provider.Provider<Consumer>, import("effect/Config").ConfigError | import("@alchemy.run/cloudflare-runtime/core").ConfigError | import("effect/PlatformError").PlatformError | import("@alchemy.run/cloudflare-runtime/core").SystemError, import("../../AlchemyContext.ts").AlchemyContext | import("../../Artifacts.ts").ArtifactStore | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | CloudflareEnvironment | import("effect/FileSystem").FileSystem | import("effect/Path").Path | Stack | queues.CloudflareOpContext>;
//# sourceMappingURL=Consumer.d.ts.map