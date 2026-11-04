import * as queues from "@distilled.cloud/cloudflare/queues";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.Queues.Subscription";
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
export const Subscription = Resource(TypeId, {
    aliases: ["Cloudflare.Queue.Subscription"],
});
/**
 * Returns true if the given value is a Subscription resource.
 */
export const isSubscription = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const SubscriptionProvider = () => Provider.succeed(Subscription, {
    stables: ["subscriptionId", "accountId", "source", "createdAt"],
    diff: Effect.fn(function* ({ olds, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        if (!isResolved(news))
            return undefined;
        if ((output?.accountId ?? accountId) !== accountId) {
            return { action: "replace" };
        }
        // The source is fixed at creation.
        const oldSource = output?.source ?? olds?.source;
        if (oldSource && !sameSource(oldSource, news.source)) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        if (output?.subscriptionId) {
            const observed = yield* getSubscriptionOrUndefined(acct, output.subscriptionId);
            return observed ? toAttributes(observed, acct) : undefined;
        }
        // Cold read — recover from lost state by matching the deterministic
        // physical name. Names are not enforced unique server-side; an exact
        // match on our generated/explicit name is the best identity we have.
        const name = yield* createSubscriptionName(id, olds?.name);
        const match = yield* findByName(acct, name);
        return match ? toAttributes(match, acct) : undefined;
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        const name = yield* createSubscriptionName(id, news.name);
        // Observe — the subscriptionId cached on `output` is a hint, not a
        // guarantee: a missing subscription falls through to create.
        let observed = output?.subscriptionId
            ? yield* getSubscriptionOrUndefined(acct, output.subscriptionId)
            : undefined;
        // Ensure — create if missing. Cloudflare allows a single
        // subscription per source per account; tolerate the
        // already-exists race by adopting the subscription on the same
        // source and converging it in the sync step below.
        if (!observed) {
            observed = yield* queues
                .createSubscription({
                accountId: acct,
                name,
                enabled: news.enabled ?? true,
                events: news.events,
                source: news.source,
                destination: { type: "queues.queue", queueId: news.queueId },
            })
                .pipe(Effect.catchTag("SubscriptionAlreadyExists", (error) => findBySource(acct, news.source).pipe(Effect.flatMap((match) => match ? Effect.succeed(match) : Effect.fail(error)))));
        }
        // Sync — diff observed cloud state against desired and patch only
        // the delta; skip the API call entirely on a no-op.
        const desired = {
            name,
            enabled: news.enabled ?? true,
            events: news.events,
            queueId: news.queueId,
        };
        const dirty = observed.name !== desired.name ||
            observed.enabled !== desired.enabled ||
            observed.destination.queueId !== desired.queueId ||
            !sameEvents(observed.events, desired.events);
        const final = dirty
            ? yield* queues.patchSubscription({
                accountId: acct,
                subscriptionId: observed.id,
                name: desired.name,
                enabled: desired.enabled,
                events: desired.events,
                destination: { type: "queues.queue", queueId: desired.queueId },
            })
            : observed;
        return toAttributes(final, acct);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* queues
            .deleteSubscription({
            accountId: output.accountId,
            subscriptionId: output.subscriptionId,
        })
            .pipe(Effect.catchTag("SubscriptionNotFound", () => Effect.void));
    }),
    // Account collection — subscriptions are account-scoped. Exhaustively
    // paginate `listSubscriptions` (response array is `result`) and hydrate
    // each row into the same Attributes shape `read` returns.
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* queues.listSubscriptions.pages({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((sub) => toAttributes(sub, accountId)))));
    }),
});
/**
 * Read a subscription by ID, mapping "gone" (`SubscriptionNotFound`,
 * HTTP 404 "No subscription with this ID") to `undefined`.
 */
const getSubscriptionOrUndefined = (accountId, subscriptionId) => queues
    .getSubscription({ accountId, subscriptionId })
    .pipe(Effect.catchTag("SubscriptionNotFound", () => Effect.succeed(undefined)));
/**
 * Find a subscription by exact name. Cloudflare's list endpoint has no
 * name filter, so scan the paginated stream.
 */
const findByName = (accountId, name) => queues.listSubscriptions.items({ accountId }).pipe(Stream.filter((s) => s.name === name), Stream.runHead, Effect.map(Option.getOrUndefined));
/**
 * Find the subscription attached to a given source. Cloudflare enforces
 * at most one subscription per source per account, so the first match is
 * the only one.
 */
const findBySource = (accountId, source) => queues.listSubscriptions.items({ accountId }).pipe(Stream.filter((s) => sameSource(toSource(s.source), source)), Stream.runHead, Effect.map(Option.getOrUndefined));
const createSubscriptionName = (id, name) => Effect.gen(function* () {
    return name ?? (yield* createPhysicalName({ id, lowercase: true }));
});
const toSource = (wire) => {
    const source = wire;
    switch (source.type) {
        case "workersAi.model":
            return { type: "workersAi.model", modelName: source.modelName ?? "" };
        case "workersBuilds.worker":
            return {
                type: "workersBuilds.worker",
                workerName: source.workerName ?? "",
            };
        case "workflows.workflow":
            return {
                type: "workflows.workflow",
                workflowName: source.workflowName ?? "",
            };
        case "images":
        case "kv":
        case "r2":
        case "superSlurper":
        case "vectorize":
            return { type: source.type };
        default:
            // Unknown/new source types added server-side: surface the raw type
            // so diff treats it as a foreign source rather than crashing.
            return { type: source.type };
    }
};
const sameSource = (a, b) => {
    if (a.type !== b.type)
        return false;
    switch (a.type) {
        case "workersAi.model":
            return a.modelName === b.modelName;
        case "workersBuilds.worker":
            return a.workerName === b.workerName;
        case "workflows.workflow":
            return a.workflowName === b.workflowName;
        default:
            return true;
    }
};
const sameEvents = (observed, desired) => observed.length === desired.length &&
    [...observed].sort().join(",") === [...desired].sort().join(",");
const toAttributes = (subscription, accountId) => ({
    subscriptionId: subscription.id,
    accountId,
    name: subscription.name,
    source: toSource(subscription.source),
    events: [...subscription.events],
    queueId: subscription.destination.queueId,
    enabled: subscription.enabled,
    createdAt: subscription.createdAt,
    modifiedAt: subscription.modifiedAt,
});
//# sourceMappingURL=Subscription.js.map