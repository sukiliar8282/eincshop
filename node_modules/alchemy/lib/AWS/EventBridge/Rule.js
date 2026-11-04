import * as eventbridge from "@distilled.cloud/aws/eventbridge";
import * as Effect from "effect/Effect";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, createTagsList, diffTags, hasAlchemyTags, } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
export const Rule = Resource("AWS.EventBridge.Rule");
export const RuleProvider = () => Provider.effect(Rule, Effect.gen(function* () {
    const createRuleName = (id, props = {}) => {
        if (props.name) {
            return Effect.succeed(props.name);
        }
        return createPhysicalName({
            id,
            maxLength: 64,
        });
    };
    return {
        stables: ["ruleName", "ruleArn", "eventBusName"],
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return;
            const oldName = yield* createRuleName(id, olds);
            const newName = yield* createRuleName(id, news);
            if (oldName !== newName) {
                return { action: "replace" };
            }
            const oldBus = olds.eventBusName ?? "default";
            const newBus = news.eventBusName ?? "default";
            if (oldBus !== newBus) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const { accountId, region } = yield* AWSEnvironment.current;
            // The engine guarantees `olds` is fully resolved before calling
            // `read` (Plan.ts guards every read site with `isResolved`), so
            // props can be used directly to derive identity.
            const ruleName = output?.ruleName ??
                (yield* createRuleName(id, { name: olds?.name }));
            const eventBusName = output?.eventBusName ?? olds?.eventBusName ?? "default";
            const described = yield* eventbridge
                .describeRule({
                Name: ruleName,
                EventBusName: eventBusName !== "default" ? eventBusName : undefined,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            if (!described?.Name) {
                return undefined;
            }
            const resolvedEventBusName = described.EventBusName ?? eventBusName;
            const ruleArn = toRuleArn(region, accountId, resolvedEventBusName, described.Name);
            const { Tags } = yield* eventbridge.listTagsForResource({
                ResourceARN: described.Arn ?? ruleArn,
            });
            const attrs = {
                ruleName: described.Name,
                ruleArn,
                eventBusName: resolvedEventBusName,
            };
            return (yield* hasAlchemyTags(id, Tags ?? []))
                ? attrs
                : Unowned(attrs);
        }),
        list: () => Effect.gen(function* () {
            const { accountId, region } = yield* AWSEnvironment.current;
            // A Rule belongs to an event bus and `listRules` is scoped to one
            // bus (defaulting to "default"). To enumerate every rule in the
            // account/region we first enumerate all event buses (manual
            // NextToken pagination — neither op is a paginated distilled op),
            // then list rules per bus with bounded concurrency.
            const busNames = [];
            let busToken;
            do {
                const page = yield* eventbridge.listEventBuses({
                    NextToken: busToken,
                });
                for (const bus of page.EventBuses ?? []) {
                    if (bus.Name) {
                        busNames.push(bus.Name);
                    }
                }
                busToken = page.NextToken;
            } while (busToken);
            // `listEventBuses` should include the default bus, but guarantee it.
            if (!busNames.includes("default")) {
                busNames.push("default");
            }
            const perBus = yield* Effect.forEach(busNames, (busName) => Effect.gen(function* () {
                const eventBusParam = busName !== "default" ? busName : undefined;
                const attrs = [];
                let ruleToken;
                do {
                    // A peer reconciler may delete an event bus between our
                    // `listEventBuses` snapshot and this `listRules` call —
                    // treat a vanished bus as contributing zero rules rather
                    // than failing the whole enumeration.
                    const page = yield* eventbridge
                        .listRules({
                        EventBusName: eventBusParam,
                        NextToken: ruleToken,
                    })
                        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
                    if (!page) {
                        break;
                    }
                    for (const rule of page.Rules ?? []) {
                        if (!rule.Name) {
                            continue;
                        }
                        // Rules created and owned by another AWS service (e.g.
                        // B2BI's DO-NOT-DELETE-* or DevOpsGuru's managed rules)
                        // reject DeleteRule without Force and are recreated by
                        // the owning service anyway — skip them in enumeration
                        // for account-wide teardown (nuke).
                        if (rule.ManagedBy) {
                            continue;
                        }
                        const resolvedBus = rule.EventBusName ?? busName;
                        attrs.push({
                            ruleName: rule.Name,
                            ruleArn: rule.Arn ??
                                toRuleArn(region, accountId, resolvedBus, rule.Name),
                            eventBusName: resolvedBus,
                        });
                    }
                    ruleToken = page.NextToken;
                } while (ruleToken);
                return attrs;
            }), { concurrency: 5 });
            return perBus.flat();
        }),
        reconcile: Effect.fn(function* ({ id, news = {}, output, session }) {
            const { accountId, region } = yield* AWSEnvironment.current;
            yield* validateRuleProps(news);
            const ruleName = output?.ruleName ?? (yield* createRuleName(id, news));
            const eventBusName = output?.eventBusName ??
                news.eventBusName ??
                "default";
            const eventBusParam = eventBusName !== "default" ? eventBusName : undefined;
            const internalTags = yield* createInternalTags(id);
            const desiredTags = {
                ...internalTags,
                ...news.tags,
            };
            // Ensure + Sync rule definition — `putRule` is the single
            // create-or-update API for the rule itself. It's idempotent on
            // matching params and overwrites schedule/eventPattern/state/etc.
            // on differences, so we call it unconditionally. `Tags` only
            // applies when creating; tags are reconciled separately below
            // against observed cloud tags.
            const { RuleArn } = yield* eventbridge.putRule({
                Name: ruleName,
                Description: news.description,
                EventBusName: eventBusParam,
                EventPattern: news.eventPattern
                    ? JSON.stringify(news.eventPattern)
                    : undefined,
                ScheduleExpression: news.scheduleExpression,
                State: news.state ?? "ENABLED",
                RoleArn: news.roleArn,
                Tags: createTagsList(desiredTags),
            });
            const ruleArn = RuleArn ??
                toRuleArn(region, accountId, eventBusName, ruleName);
            // Sync targets — observed cloud targets vs desired. `listTargetsByRule`
            // gives us the live target ids; we remove anything no longer desired,
            // and `putTargets` overwrites/upserts the rest.
            const resolvedTargets = news.targets ?? [];
            const desiredTargetIds = new Set(resolvedTargets.map((t) => t.Id));
            const observedTargets = yield* eventbridge
                .listTargetsByRule({
                Rule: ruleName,
                EventBusName: eventBusParam,
            })
                .pipe(Effect.map((r) => r.Targets ?? []), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed([])));
            const removedTargetIds = observedTargets
                .map((t) => t.Id)
                .filter((tid) => !!tid && !desiredTargetIds.has(tid));
            if (removedTargetIds.length > 0) {
                const response = yield* eventbridge
                    .removeTargets({
                    Rule: ruleName,
                    EventBusName: eventBusParam,
                    Ids: removedTargetIds,
                })
                    .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
                if (response) {
                    yield* assertRemoveTargetsSucceeded(response);
                }
            }
            if (resolvedTargets.length > 0) {
                const response = yield* eventbridge.putTargets({
                    Rule: ruleName,
                    EventBusName: eventBusParam,
                    Targets: resolvedTargets.map(toTarget),
                });
                yield* assertPutTargetsSucceeded(response);
            }
            // Sync tags — diff observed cloud tags against desired. Adoption
            // and partial prior runs both converge here.
            const observedTagsList = yield* eventbridge
                .listTagsForResource({
                ResourceARN: ruleArn,
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
                    ResourceARN: ruleArn,
                    TagKeys: removed,
                });
            }
            if (upsert.length > 0) {
                yield* eventbridge.tagResource({
                    ResourceARN: ruleArn,
                    Tags: upsert,
                });
            }
            yield* session.note(ruleArn);
            return {
                ruleName,
                ruleArn,
                eventBusName,
            };
        }),
        delete: Effect.fn(function* (input) {
            const ruleName = input.output.ruleName;
            const eventBusName = input.output.eventBusName;
            const eventBusParam = eventBusName !== "default" ? eventBusName : undefined;
            const { Targets } = yield* eventbridge
                .listTargetsByRule({
                Rule: ruleName,
                EventBusName: eventBusParam,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed({ Targets: undefined })));
            if (Targets && Targets.length > 0) {
                const response = yield* eventbridge
                    .removeTargets({
                    Rule: ruleName,
                    EventBusName: eventBusParam,
                    Ids: Targets.map((t) => t.Id),
                })
                    .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
                if (response) {
                    yield* assertRemoveTargetsSucceeded(response);
                }
            }
            yield* eventbridge
                .deleteRule({
                Name: ruleName,
                EventBusName: eventBusParam,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    };
}));
const toTarget = (target) => ({
    Id: target.Id,
    Arn: target.Arn,
    RoleArn: target.RoleArn,
    Input: target.Input,
    InputPath: target.InputPath,
    InputTransformer: target.InputTransformer,
    KinesisParameters: target.KinesisParameters,
    RunCommandParameters: target.RunCommandParameters,
    EcsParameters: target.EcsParameters
        ? {
            ...target.EcsParameters,
            TaskDefinitionArn: target.EcsParameters.TaskDefinitionArn,
        }
        : undefined,
    BatchParameters: target.BatchParameters
        ? {
            ...target.BatchParameters,
            JobDefinition: target.BatchParameters.JobDefinition,
        }
        : undefined,
    SqsParameters: target.SqsParameters,
    HttpParameters: target.HttpParameters,
    RedshiftDataParameters: target.RedshiftDataParameters,
    SageMakerPipelineParameters: target.SageMakerPipelineParameters,
    DeadLetterConfig: target.DeadLetterConfig
        ? { Arn: target.DeadLetterConfig.Arn }
        : undefined,
    RetryPolicy: target.RetryPolicy,
    AppSyncParameters: target.AppSyncParameters,
});
const toRuleArn = (region, accountId, eventBusName, ruleName) => (eventBusName === "default"
    ? `arn:aws:events:${region}:${accountId}:rule/${ruleName}`
    : `arn:aws:events:${region}:${accountId}:rule/${eventBusName}/${ruleName}`);
const validateRuleProps = Effect.fn(function* (props) {
    if (!props.eventPattern && !props.scheduleExpression) {
        return yield* Effect.fail(new Error("EventBridge Rule requires either `eventPattern` or `scheduleExpression`"));
    }
});
const assertPutTargetsSucceeded = Effect.fn(function* (response) {
    if ((response.FailedEntryCount ?? 0) > 0) {
        return yield* Effect.fail(new Error(`Failed to attach EventBridge targets: ${JSON.stringify(response.FailedEntries ?? [])}`));
    }
});
const assertRemoveTargetsSucceeded = Effect.fn(function* (response) {
    if ((response.FailedEntryCount ?? 0) > 0) {
        return yield* Effect.fail(new Error(`Failed to remove EventBridge targets: ${JSON.stringify(response.FailedEntries ?? [])}`));
    }
});
//# sourceMappingURL=Rule.js.map