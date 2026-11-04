import * as queues from "@distilled.cloud/cloudflare/queues";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Queues.Subscription";
type TypeId = typeof TypeId;
/**
 * The Cloudflare product whose events the subscription delivers into the
 * Queue. Cloudflare allows a single subscription per source per account,
 * and the source is fixed at creation — changing it triggers a
 * replacement.
 */
export type SubscriptionSource = {
    /** Cloudflare Images events. */
    type: "images";
} | {
    /** Workers KV namespace events. */
    type: "kv";
} | {
    /** R2 bucket events. */
    type: "r2";
} | {
    /** Super Slurper migration events. */
    type: "superSlurper";
} | {
    /** Vectorize index events. */
    type: "vectorize";
} | {
    /** Workers AI model events for a specific model. */
    type: "workersAi.model";
    /** Name of the Workers AI model to subscribe to. */
    modelName: string;
} | {
    /** Workers Builds events for a specific Worker. */
    type: "workersBuilds.worker";
    /** Name of the Worker whose build events to subscribe to. */
    workerName: string;
} | {
    /** Workflows events for a specific workflow. */
    type: "workflows.workflow";
    /** Name of the workflow to subscribe to. */
    workflowName: string;
};
export type SubscriptionProps = {
    /**
     * Human readable name of the subscription. If omitted, a unique name is
     * generated from the app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * The event source to subscribe to (e.g. `{ type: "r2" }` for R2 bucket
     * events). Fixed at creation — changing it triggers a replacement.
     * Cloudflare allows at most one subscription per source per account.
     */
    source: SubscriptionSource;
    /**
     * Event types to deliver, scoped to the source (e.g. `bucket.created`
     * and `bucket.deleted` for the `r2` source, `namespace.created` for
     * `kv`). Must contain at least one event type valid for the source.
     */
    events: string[];
    /**
     * The ID of the Queue that receives the events
     * (the destination, e.g. `queue.queueId`).
     */
    queueId: string;
    /**
     * Whether the subscription is active.
     * @default true
     */
    enabled?: boolean;
};
export type SubscriptionAttributes = {
    /**
     * Unique identifier for the subscription.
     */
    subscriptionId: string;
    /**
     * The Cloudflare account the subscription belongs to.
     */
    accountId: string;
    /**
     * Human readable name of the subscription.
     */
    name: string;
    /**
     * The event source the subscription listens to.
     */
    source: SubscriptionSource;
    /**
     * Event types delivered by this subscription.
     */
    events: string[];
    /**
     * The ID of the destination Queue.
     */
    queueId: string;
    /**
     * Whether the subscription is active.
     */
    enabled: boolean;
    /**
     * When the subscription was created.
     */
    createdAt: string;
    /**
     * When the subscription was last modified.
     */
    modifiedAt: string;
};
export type Subscription = Resource<TypeId, SubscriptionProps, SubscriptionAttributes, never, Providers>;
/**
 * A Cloudflare Queues event subscription — delivers platform events
 * (R2 bucket events, KV namespace events, Workers Builds, Workflows,
 * etc.) into a Queue as messages.
 *
 * The `source` selects which product emits the events and is fixed at
 * creation (changing it replaces the subscription). `name`, `events`,
 * `enabled`, and the destination `queueId` are all mutable in place.
 * Cloudflare allows at most one subscription per source per account.
 * ### Creating a Subscription
 * **Example:** R2 bucket events into a Queue
 * ```typescript
 * const queue = yield* Cloudflare.Queues.Queue("EventsQueue");
 *
 * const subscription = yield* Cloudflare.Queues.Subscription("R2Events", {
 *   source: { type: "r2" },
 *   events: ["bucket.created", "bucket.deleted"],
 *   queueId: queue.queueId,
 * });
 * ```
 *
 * **Example:** KV namespace events with an explicit name
 * ```typescript
 * const subscription = yield* Cloudflare.Queues.Subscription("KvEvents", {
 *   name: "kv-events",
 *   source: { type: "kv" },
 *   events: ["namespace.created"],
 *   queueId: queue.queueId,
 * });
 * ```
 *
 * **Example:** Workers Builds events for one Worker
 * ```typescript
 * const subscription = yield* Cloudflare.Queues.Subscription("BuildEvents", {
 *   source: { type: "workersBuilds.worker", workerName: "my-worker" },
 *   events: ["build.started", "build.completed"],
 *   queueId: queue.queueId,
 * });
 * ```
 *
 * ### Pausing delivery
 * **Example:** Disable a subscription without deleting it
 * ```typescript
 * const subscription = yield* Cloudflare.Queues.Subscription("R2Events", {
 *   source: { type: "r2" },
 *   events: ["bucket.created"],
 *   queueId: queue.queueId,
 *   enabled: false,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/queues/event-subscriptions/
 *
 * @resource
 * @product Queues
 * @category Storage & Databases
 */
export declare const Subscription: import("../../Resource.ts").ResourceClass<Subscription>;
/**
 * Returns true if the given value is a Subscription resource.
 */
export declare const isSubscription: (value: unknown) => value is Subscription;
export declare const SubscriptionProvider: () => import("effect/Layer").Layer<Provider.Provider<Subscription>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | queues.CloudflareOpContext>;
export {};
//# sourceMappingURL=Subscription.d.ts.map