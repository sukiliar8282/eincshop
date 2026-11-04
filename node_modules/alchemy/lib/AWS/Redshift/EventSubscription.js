import * as redshift from "@distilled.cloud/aws/redshift";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
import { applyRedshiftTagDelta, redshiftArn, sameStringSet, toTagRecord, } from "./internal.js";
/**
 * An Amazon Redshift event notification subscription — routes provisioned
 * cluster lifecycle events (maintenance, resizes, snapshots, failures,
 * security changes) to an SNS topic.
 *
 * SNS is Redshift's native event channel for provisioned clusters: the only
 * events Redshift publishes *directly* to EventBridge are the zero-ETL
 * integration detail-types, so cluster events reach compute through an
 * `EventSubscription` → `SNS.Topic` → `SNS.consumeTopicNotifications` chain.
 * Subscriptions are free and provision instantly.
 * ### Subscribing to Cluster Events
 * **Example:** Route Cluster Events to an SNS Topic
 * ```typescript
 * const alerts = yield* SNS.Topic("WarehouseAlerts", {});
 * const subscription = yield* Redshift.EventSubscription("WarehouseEvents", {
 *   snsTopicArn: alerts.topicArn,
 *   sourceType: "cluster",
 *   sourceIds: [cluster.clusterIdentifier],
 * });
 * ```
 * **Example:** Only Error-Severity Monitoring Events
 * ```typescript
 * const subscription = yield* Redshift.EventSubscription("WarehouseErrors", {
 *   snsTopicArn: alerts.topicArn,
 *   eventCategories: ["monitoring"],
 *   severity: "ERROR",
 * });
 * ```
 * **Example:** Consume the Events in a Function
 * ```typescript
 * // inside a Lambda Function definition:
 * yield* SNS.consumeTopicNotifications(alerts, (messages) =>
 *   Stream.runForEach(messages, (message) =>
 *     Effect.logInfo(`redshift event: ${message.Message}`),
 *   ),
 * );
 * ```
 *
 * @resource
 */
export const EventSubscription = Resource("AWS.Redshift.EventSubscription");
/**
 * Retry an effect while the subscription is mid-transition
 * (`InvalidSubscriptionStateFault`), bounded to ~2 minutes.
 *
 * Expressed as an explicitly-typed module-scope helper: inlining
 * `Effect.retry` in a lifecycle operation leaves `Retry.Return`'s
 * conditional type unresolved in the provider's inferred layer type, which
 * declaration emit widens to an `unknown` R — poisoning `AWS.providers()`
 * for every downstream consumer.
 */
const retryWhileSubscriptionTransitioning = (self) => Effect.retry(self, {
    while: (e) => e._tag === "InvalidSubscriptionStateFault",
    schedule: Schedule.max([Schedule.fixed("5 seconds"), Schedule.recurs(24)]),
});
export const EventSubscriptionProvider = () => Provider.effect(EventSubscription, Effect.gen(function* () {
    const toName = (id, props) => props.subscriptionName
        ? Effect.succeed(props.subscriptionName)
        : createPhysicalName({ id, maxLength: 255, lowercase: true });
    const readSubscription = Effect.fn(function* (name) {
        const response = yield* redshift
            .describeEventSubscriptions({ SubscriptionName: name })
            .pipe(Effect.catchTag("SubscriptionNotFoundFault", () => Effect.succeed(undefined)));
        return response?.EventSubscriptionsList?.[0];
    });
    const toAttrs = Effect.fn(function* (subscription) {
        const { accountId, region } = yield* AWSEnvironment.current;
        if (!subscription.CustSubscriptionId) {
            return yield* Effect.fail(new Error("Event subscription is missing its name"));
        }
        return {
            subscriptionName: subscription.CustSubscriptionId,
            eventSubscriptionArn: redshiftArn(region, accountId, "eventsubscription", subscription.CustSubscriptionId),
            snsTopicArn: subscription.SnsTopicArn,
            status: subscription.Status,
            sourceType: subscription.SourceType,
            sourceIds: subscription.SourceIdsList ?? [],
            eventCategories: subscription.EventCategoriesList ?? [],
            severity: subscription.Severity,
            enabled: subscription.Enabled,
            tags: toTagRecord(subscription.Tags),
        };
    });
    return {
        stables: ["subscriptionName", "eventSubscriptionArn"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            if ((yield* toName(id, olds ?? {})) !== (yield* toName(id, news ?? {}))) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.subscriptionName ?? (yield* toName(id, olds ?? {}));
            const subscription = yield* readSubscription(name);
            if (!subscription?.CustSubscriptionId)
                return undefined;
            const attrs = yield* toAttrs(subscription);
            return (yield* hasAlchemyTags(id, attrs.tags))
                ? attrs
                : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.subscriptionName ?? (yield* toName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // 1. Observe — cloud state is authoritative.
            let observed = yield* readSubscription(name);
            // 2. Ensure — create if missing; tolerate AlreadyExists as a race
            //    with a peer reconciler by re-reading.
            if (!observed?.CustSubscriptionId) {
                yield* redshift
                    .createEventSubscription({
                    SubscriptionName: name,
                    SnsTopicArn: news.snsTopicArn,
                    SourceType: news.sourceType,
                    SourceIds: news.sourceIds,
                    EventCategories: news.eventCategories,
                    Severity: news.severity,
                    Enabled: news.enabled ?? true,
                    Tags: Object.entries(desiredTags).map(([Key, Value]) => ({
                        Key,
                        Value,
                    })),
                })
                    .pipe(Effect.catchTag("SubscriptionAlreadyExistFault", () => Effect.void));
                observed = yield* readSubscription(name);
                if (!observed?.CustSubscriptionId) {
                    return yield* Effect.fail(new Error(`Failed to create event subscription '${name}'`));
                }
            }
            // 3. Sync — diff OBSERVED filters against desired; modify replaces
            //    the whole filter configuration, so send the full desired
            //    shape when anything drifted.
            const desiredEnabled = news.enabled ?? true;
            if (observed.SnsTopicArn !== news.snsTopicArn ||
                observed.SourceType !== news.sourceType ||
                !sameStringSet(observed.SourceIdsList, news.sourceIds) ||
                !sameStringSet(observed.EventCategoriesList, news.eventCategories) ||
                observed.Severity !== news.severity ||
                observed.Enabled !== desiredEnabled) {
                yield* retryWhileSubscriptionTransitioning(redshift.modifyEventSubscription({
                    SubscriptionName: name,
                    SnsTopicArn: news.snsTopicArn,
                    SourceType: news.sourceType,
                    SourceIds: news.sourceIds,
                    EventCategories: news.eventCategories,
                    Severity: news.severity,
                    Enabled: desiredEnabled,
                }));
                observed = yield* readSubscription(name);
                if (!observed?.CustSubscriptionId) {
                    return yield* Effect.fail(new Error(`Event subscription '${name}' not found after update`));
                }
            }
            // 3b. Sync tags — diff against OBSERVED cloud tags (describe
            //     surfaces them inline).
            const { accountId, region } = yield* AWSEnvironment.current;
            const arn = redshiftArn(region, accountId, "eventsubscription", name);
            const { removed, upsert } = diffTags(toTagRecord(observed.Tags), desiredTags);
            yield* applyRedshiftTagDelta({ arn, upsert, removed });
            yield* session.note(arn);
            const attrs = yield* toAttrs(observed);
            return { ...attrs, tags: desiredTags };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* retryWhileSubscriptionTransitioning(redshift
                .deleteEventSubscription({
                SubscriptionName: output.subscriptionName,
            })
                .pipe(Effect.catchTag("SubscriptionNotFoundFault", () => Effect.succeed(undefined))));
        }),
        list: () => 
        // Top-level account/region collection: exhaustively paginate
        // describeEventSubscriptions; tags come inline on each entry.
        redshift.describeEventSubscriptions.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.EventSubscriptionsList ?? []).filter((subscription) => subscription.CustSubscriptionId !== undefined))), Effect.flatMap(Effect.forEach((subscription) => toAttrs(subscription), {
            concurrency: 4,
        }))),
    };
}));
//# sourceMappingURL=EventSubscription.js.map