import * as eventbridge from "@distilled.cloud/aws/eventbridge";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, createTagsList, diffTags, hasAlchemyTags, } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
export const EventBus = Resource("AWS.EventBridge.EventBus");
export const EventBusProvider = () => Provider.effect(EventBus, Effect.gen(function* () {
    const createEventBusName = (id, props = {}) => Effect.gen(function* () {
        if (props.name) {
            return props.name;
        }
        return yield* createPhysicalName({
            id,
            maxLength: 256,
        });
    });
    return {
        stables: ["eventBusName", "eventBusArn"],
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return;
            const oldName = yield* createEventBusName(id, olds);
            const newName = yield* createEventBusName(id, news);
            if (oldName !== newName) {
                return { action: "replace" };
            }
            if ((olds.eventSourceName ?? "") !== (news.eventSourceName ?? "")) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const eventBusName = output?.eventBusName ?? (yield* createEventBusName(id, olds ?? {}));
            const described = yield* eventbridge
                .describeEventBus({
                Name: eventBusName,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            if (!described?.Arn || !described.Name) {
                return undefined;
            }
            const { Tags } = yield* eventbridge.listTagsForResource({
                ResourceARN: described.Arn,
            });
            const attrs = {
                eventBusName: described.Name,
                eventBusArn: described.Arn,
                description: described.Description,
            };
            return (yield* hasAlchemyTags(id, Tags ?? []))
                ? attrs
                : Unowned(attrs);
        }),
        list: () => Effect.gen(function* () {
            // Enumerate every event bus in the ambient account/region via
            // manual NextToken pagination (listEventBuses is not a paginated
            // distilled op). The AWS-managed `default` bus is excluded — the
            // EventBus resource cannot manage it (name "default" is reserved).
            const attrs = [];
            let nextToken;
            do {
                const page = yield* eventbridge.listEventBuses({
                    NextToken: nextToken,
                });
                for (const bus of page.EventBuses ?? []) {
                    if (!bus.Name || !bus.Arn || bus.Name === "default") {
                        continue;
                    }
                    attrs.push({
                        eventBusName: bus.Name,
                        eventBusArn: bus.Arn,
                        description: bus.Description,
                    });
                }
                nextToken = page.NextToken;
            } while (nextToken);
            return attrs;
        }),
        reconcile: Effect.fn(function* ({ id, news = {}, output, session }) {
            const { accountId, region } = yield* AWSEnvironment.current;
            const eventBusName = output?.eventBusName ?? (yield* createEventBusName(id, news));
            const eventBusArn = (output?.eventBusArn ??
                `arn:aws:events:${region}:${accountId}:event-bus/${eventBusName}`);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = {
                ...internalTags,
                ...news.tags,
            };
            // Observe — fetch live cloud state. We don't trust `output`
            // blindly: a bus deleted out of band shows up as missing and we
            // recreate. Foreign-tagged buses have already been screened by
            // `read` upstream.
            let described = yield* eventbridge
                .describeEventBus({
                Name: eventBusName,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            // Ensure — create the bus if missing. Tolerate
            // `ResourceAlreadyExistsException` as a race with a peer
            // reconciler: re-read and continue with the sync path.
            if (!described?.Arn) {
                yield* eventbridge
                    .createEventBus({
                    Name: eventBusName,
                    EventSourceName: news.eventSourceName,
                    Description: news.description,
                    KmsKeyIdentifier: news.kmsKeyIdentifier,
                    DeadLetterConfig: news.deadLetterConfig
                        ? { Arn: news.deadLetterConfig.Arn }
                        : undefined,
                    LogConfig: news.logConfig,
                    Tags: createTagsList(desiredTags),
                })
                    .pipe(Effect.catchTag("ResourceAlreadyExistsException", () => Effect.void));
                described = yield* eventbridge
                    .describeEventBus({
                    Name: eventBusName,
                })
                    .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            }
            // Sync mutable bus configuration — `updateEventBus` overwrites
            // `description`, KMS key, DLQ, and log config in one shot, so we
            // call it unconditionally (idempotent for matching values).
            yield* eventbridge.updateEventBus({
                Name: eventBusName,
                Description: news.description,
                KmsKeyIdentifier: news.kmsKeyIdentifier,
                DeadLetterConfig: news.deadLetterConfig
                    ? { Arn: news.deadLetterConfig.Arn }
                    : undefined,
                LogConfig: news.logConfig,
            });
            // Sync tags — diff observed cloud tags against desired. Adoption
            // may bring us a bus with its own tag set; diffing against the
            // freshly-fetched tags lets the reconciler converge regardless.
            const observedTagsList = yield* eventbridge
                .listTagsForResource({
                ResourceARN: eventBusArn,
            })
                .pipe(Effect.map((r) => r.Tags ?? []));
            const observedTags = {};
            for (const tag of observedTagsList) {
                if (tag.Key && tag.Value !== undefined) {
                    observedTags[tag.Key] = tag.Value;
                }
            }
            const { removed, upsert } = diffTags(observedTags, desiredTags);
            if (removed.length > 0) {
                yield* eventbridge.untagResource({
                    ResourceARN: eventBusArn,
                    TagKeys: removed,
                });
            }
            if (upsert.length > 0) {
                yield* eventbridge.tagResource({
                    ResourceARN: eventBusArn,
                    Tags: upsert,
                });
            }
            yield* session.note(eventBusArn);
            return {
                eventBusName,
                eventBusArn,
                description: news.description,
            };
        }),
        delete: Effect.fn(function* ({ olds = {}, output }) {
            const eventBusName = output.eventBusName;
            // Rules the engine knows about are deleted first (they depend on
            // the bus), but AWS-managed rules can linger: deleting an archive
            // removes its hidden archival rule *asynchronously*, sometimes
            // minutes later, during which deleteEventBus keeps failing with
            // EventBusHasRules. Sweep remaining rules with Force (required for
            // managed rules) instead of waiting out AWS's async cleanup:
            // AWS-managed rules (`ManagedBy` set) are always swept; rules
            // created out-of-band by the user are only swept when
            // `forceDestroy` is enabled.
            yield* Effect.gen(function* () {
                let nextToken;
                do {
                    const page = yield* eventbridge.listRules({
                        EventBusName: eventBusName,
                        NextToken: nextToken,
                    });
                    for (const rule of page.Rules ?? []) {
                        if (!rule.Name)
                            continue;
                        if (!rule.ManagedBy && !olds.forceDestroy)
                            continue;
                        const targets = yield* eventbridge
                            .listTargetsByRule({
                            Rule: rule.Name,
                            EventBusName: eventBusName,
                        })
                            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed({ Targets: [] })));
                        const targetIds = (targets.Targets ?? []).map((t) => t.Id);
                        if (targetIds.length > 0) {
                            yield* eventbridge
                                .removeTargets({
                                Rule: rule.Name,
                                EventBusName: eventBusName,
                                Ids: targetIds,
                                Force: true,
                            })
                                .pipe(Effect.catchTag(["ResourceNotFoundException", "ManagedRuleException"], () => Effect.void));
                        }
                        yield* eventbridge
                            .deleteRule({
                            Name: rule.Name,
                            EventBusName: eventBusName,
                            Force: true,
                        })
                            .pipe(Effect.catchTag(["ResourceNotFoundException", "ManagedRuleException"], () => Effect.void));
                    }
                    nextToken = page.NextToken;
                } while (nextToken);
            }).pipe(
            // Bus already gone (or vanishes mid-sweep) — nothing to sweep.
            Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            // The sweep and EventBridge's own bookkeeping are eventually
            // consistent — a just-deleted rule can still count against the bus
            // for a few seconds. Retry the typed dependency violation on a
            // bounded schedule.
            yield* eventbridge
                .deleteEventBus({
                Name: eventBusName,
            })
                .pipe(Effect.retry({
                while: (e) => e._tag === "EventBusHasRules",
                schedule: Schedule.spaced("3 seconds"),
                times: 10,
            }), 
            // Bus already gone (deleted out-of-band, or a previous
            // destroy partially succeeded) — delete is idempotent.
            Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=EventBus.js.map