import * as securitylake from "@distilled.cloud/aws/securitylake";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags } from "../../Tags.js";
import { readSecurityLakeTags, retryWhileConflict, toTagList, } from "./internal.js";
/**
 * A Security Lake subscriber — a consumer (account or service) granted access
 * to data in the Security Lake data lake for specific log sources.
 *
 * ### Creating a Subscriber
 * **Example:** S3 data-access subscriber
 * ```typescript
 * const subscriber = yield* SecurityLake.Subscriber("Analytics", {
 *   subscriberIdentity: {
 *     principal: "123456789012",
 *     externalId: "analytics-external-id",
 *   },
 *   sources: [{ awsLogSource: { sourceName: "ROUTE53", sourceVersion: "2.0" } }],
 * });
 * ```
 *
 * **Example:** Lake Formation (query) access
 * ```typescript
 * const subscriber = yield* SecurityLake.Subscriber("Athena", {
 *   subscriberName: "athena-consumer",
 *   subscriberDescription: "Athena query access to VPC flow logs",
 *   subscriberIdentity: {
 *     principal: "123456789012",
 *     externalId: "athena-external-id",
 *   },
 *   sources: [{ awsLogSource: { sourceName: "VPC_FLOW", sourceVersion: "2.0" } }],
 *   accessTypes: ["LAKEFORMATION"],
 *   tags: { team: "security" },
 * });
 * ```
 */
const SubscriberResource = Resource("AWS.SecurityLake.Subscriber");
export { SubscriberResource as Subscriber };
/**
 * `CreateSubscriber` returned without a subscriber body and the subscriber
 * could not be re-observed by name.
 */
export class SubscriberCreateFailed extends Data.TaggedError("SubscriberCreateFailed") {
}
const buildAttrs = (subscriber) => ({
    subscriberId: subscriber.subscriberId,
    subscriberArn: subscriber.subscriberArn,
    subscriberName: subscriber.subscriberName,
    subscriberStatus: subscriber.subscriberStatus,
    roleArn: subscriber.roleArn,
    s3BucketArn: subscriber.s3BucketArn,
    subscriberEndpoint: subscriber.subscriberEndpoint,
    resourceShareArn: subscriber.resourceShareArn,
    resourceShareName: subscriber.resourceShareName,
});
// Desired sources match observed sources when every desired entry appears in
// the observed list (AWS resolves an omitted sourceVersion, so it is only
// compared when the desired entry pins one) and the counts agree.
const sourcesMatch = (desired, observed) => desired.length === observed.length &&
    desired.every((want) => {
        const wantAws = want.awsLogSource;
        if (wantAws !== undefined) {
            return observed.some((have) => {
                const haveAws = have.awsLogSource;
                return (haveAws !== undefined &&
                    haveAws.sourceName === wantAws.sourceName &&
                    (wantAws.sourceVersion === undefined ||
                        haveAws.sourceVersion === wantAws.sourceVersion));
            });
        }
        return observed.some((have) => have.customLogSource?.sourceName === want.customLogSource?.sourceName &&
            (want.customLogSource?.sourceVersion === undefined ||
                have.customLogSource?.sourceVersion ===
                    want.customLogSource.sourceVersion));
    });
export const SubscriberProvider = () => Provider.effect(SubscriberResource, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.subscriberName ??
            (yield* createPhysicalName({ id, maxLength: 64 })));
    });
    const getById = (subscriberId) => securitylake.getSubscriber({ subscriberId }).pipe(Effect.map((response) => response.subscriber), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    // Subscriber names are unique per account/region — find the live
    // subscriber carrying our deterministic name when state was lost.
    const findByName = (subscriberName) => securitylake.listSubscribers.items({}).pipe(Stream.filter((subscriber) => subscriber.subscriberName === subscriberName), Stream.take(1), Stream.runHead, Effect.map(Option.getOrUndefined));
    return {
        read: Effect.fn(function* ({ id, olds, output }) {
            // An account that never onboarded Security Lake rejects subscriber
            // APIs with UnauthorizedException — that means "no subscriber".
            const subscriber = yield* (output?.subscriberId
                ? getById(output.subscriberId)
                : Effect.flatMap(createName(id, olds ?? {}), findByName)).pipe(Effect.catchTag("UnauthorizedException", () => Effect.succeed(undefined)));
            if (subscriber === undefined)
                return undefined;
            const attrs = buildAttrs(subscriber);
            const tags = yield* readSecurityLakeTags(attrs.subscriberArn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        list: () => securitylake.listSubscribers.items({}).pipe(Stream.runCollect, Effect.map((subscribers) => [...subscribers].map(buildAttrs)), 
        // An account that never onboarded Security Lake has no
        // subscribers to enumerate.
        Effect.catchTag([
            "AccessDeniedException",
            "ResourceNotFoundException",
            "UnauthorizedException",
        ], () => Effect.succeed([]))),
        // accessTypes is create-only (UpdateSubscriber cannot change it).
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldAccess = [...(olds.accessTypes ?? ["S3"])].sort();
            const newAccess = [...(news.accessTypes ?? ["S3"])].sort();
            if (oldAccess.length !== newAccess.length ||
                oldAccess.some((value, index) => value !== newAccess[index])) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const subscriberName = yield* createName(id, news);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // 1. OBSERVE — by cached id first, then by deterministic name.
            let subscriber = output?.subscriberId
                ? yield* getById(output.subscriberId)
                : undefined;
            subscriber ??= yield* findByName(subscriberName);
            // 2. ENSURE — create when missing; a ConflictException means a
            // concurrent create won the race, so re-observe by name.
            if (subscriber === undefined) {
                subscriber = yield* securitylake
                    .createSubscriber({
                    subscriberName,
                    subscriberIdentity: news.subscriberIdentity,
                    subscriberDescription: news.subscriberDescription,
                    sources: news.sources,
                    accessTypes: news.accessTypes,
                    tags: toTagList(desiredTags),
                })
                    .pipe(Effect.map((response) => response.subscriber), Effect.catchTag("ConflictException", () => findByName(subscriberName)));
                if (subscriber === undefined) {
                    return yield* Effect.fail(new SubscriberCreateFailed({ subscriberName }));
                }
            }
            else {
                // 3. SYNC mutable settings — observed ↔ desired.
                const changed = subscriber.subscriberName !== subscriberName ||
                    (subscriber.subscriberDescription ?? "") !==
                        (news.subscriberDescription ?? "") ||
                    subscriber.subscriberIdentity.principal !==
                        news.subscriberIdentity.principal ||
                    subscriber.subscriberIdentity.externalId !==
                        news.subscriberIdentity.externalId ||
                    !sourcesMatch(news.sources, subscriber.sources);
                if (changed) {
                    subscriber = yield* securitylake
                        .updateSubscriber({
                        subscriberId: subscriber.subscriberId,
                        subscriberName,
                        subscriberDescription: news.subscriberDescription,
                        subscriberIdentity: news.subscriberIdentity,
                        sources: news.sources,
                    })
                        .pipe(retryWhileConflict, Effect.map((response) => response.subscriber ?? subscriber));
                }
                // 3b. SYNC tags — diff against OBSERVED cloud tags.
                const observedTags = yield* readSecurityLakeTags(subscriber.subscriberArn);
                const { upsert, removed } = diffTags(observedTags, desiredTags);
                if (upsert.length > 0) {
                    yield* securitylake.tagResource({
                        resourceArn: subscriber.subscriberArn,
                        tags: upsert.map((t) => ({ key: t.Key, value: t.Value })),
                    });
                }
                if (removed.length > 0) {
                    yield* securitylake.untagResource({
                        resourceArn: subscriber.subscriberArn,
                        tagKeys: removed,
                    });
                }
            }
            // 4. RETURN fresh attributes.
            const final = (yield* getById(subscriber.subscriberId)) ?? subscriber;
            yield* session.note(final.subscriberArn);
            return buildAttrs(final);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* securitylake
                .deleteSubscriber({ subscriberId: output.subscriberId })
                .pipe(retryWhileConflict, 
            // Gone already, or the data lake itself was offboarded first
            // (which removes all subscribers and makes subscriber APIs
            // reject with UnauthorizedException).
            Effect.catchTag(["ResourceNotFoundException", "UnauthorizedException"], () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=Subscriber.js.map