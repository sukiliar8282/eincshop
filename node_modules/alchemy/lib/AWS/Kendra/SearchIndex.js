import * as kendra from "@distilled.cloud/aws/kendra";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as EffectStream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags, } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
/**
 * An Amazon Kendra index — a machine-learning powered enterprise search
 * index that data sources (S3, SharePoint, databases, ...) sync documents
 * into and that applications query with natural language.
 *
 * :::caution
 * Provisioning an index takes ~20–30 minutes and bills hourly from the
 * moment the index becomes `ACTIVE` (including the Developer edition's
 * free-tier-exhausted rate). Destroy indexes promptly.
 * :::
 * ### Creating Indexes
 * **Example:** Developer-Edition Index
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const role = yield* AWS.IAM.Role("KendraRole", {
 *   assumeRolePolicy: {
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Effect: "Allow",
 *       Principal: { Service: "kendra.amazonaws.com" },
 *       Action: "sts:AssumeRole",
 *     }],
 *   },
 *   policies: [{
 *     policyName: "logs",
 *     policyDocument: {
 *       Version: "2012-10-17",
 *       Statement: [{
 *         Effect: "Allow",
 *         Action: ["logs:*", "cloudwatch:PutMetricData"],
 *         Resource: "*",
 *       }],
 *     },
 *   }],
 * });
 *
 * const index = yield* AWS.Kendra.Index("Search", {
 *   edition: "DEVELOPER_EDITION",
 *   roleArn: role.roleArn,
 * });
 * ```
 *
 * @resource
 */
export const Index = Resource("AWS.Kendra.Index");
const createIndexName = (id, props) => props.name
    ? Effect.succeed(props.name)
    : createPhysicalName({ id, maxLength: 100 });
const fetchTags = Effect.fn(function* (arn) {
    const response = yield* kendra
        .listTagsForResource({ ResourceARN: arn })
        .pipe(Effect.catchTag(["ResourceNotFoundException", "ResourceUnavailableException"], () => Effect.succeed(undefined)));
    return Object.fromEntries((response?.Tags ?? []).map((tag) => [tag.Key, tag.Value]));
});
const readIndexById = Effect.fn(function* (id, arnOf) {
    const described = yield* kendra
        .describeIndex({ Id: id })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    if (!described || described.Status === "DELETING")
        return undefined;
    const arn = arnOf(described.Id ?? id);
    const state = {
        described,
        attrs: {
            id: described.Id ?? id,
            arn,
            name: described.Name ?? "",
            edition: described.Edition,
            status: described.Status,
            roleArn: described.RoleArn ?? "",
            tags: yield* fetchTags(arn),
        },
    };
    return state;
});
const findIndexByName = Effect.fn(function* (name, arnOf) {
    const summaries = yield* kendra.listIndices.pages({}).pipe(EffectStream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.IndexConfigurationSummaryItems ?? [])));
    const match = summaries.find((summary) => summary.Name === name && summary.Status !== "DELETING");
    if (!match?.Id)
        return undefined;
    return yield* readIndexById(match.Id, arnOf);
});
/**
 * An index still transitioning toward the awaited status — retried by
 * {@link waitForIndexStatus}'s bounded schedule.
 */
class IndexNotReady extends Data.TaggedError("IndexNotReady") {
}
/**
 * An index whose asynchronous provisioning converged to the terminal
 * `FAILED` status.
 */
export class IndexProvisioningFailed extends Data.TaggedError("IndexProvisioningFailed") {
}
// Explicitly-typed retry wrapper — an inline `Effect.retry` in provider
// lifecycle code leaks `Retry.Return`'s conditional type into declaration
// emit and widens the provider layer to `unknown` for every consumer of
// `AWS.providers()`.
const retryWhileNotReady = (self) => Effect.retry(self, {
    while: (e) => e._tag === "IndexNotReady",
    // Index provisioning is slow (~20–30 min); poll every 20s up to ~40 min.
    schedule: Schedule.max([
        Schedule.spaced("20 seconds"),
        Schedule.recurs(120),
    ]),
});
// CreateIndex validates the IAM role up front; a freshly-created role may
// not have propagated yet and surfaces as ValidationException. Bounded retry
// through the propagation window (~60s). Explicitly typed for the same
// declaration-emit reason as retryWhileNotReady.
const retryThroughIamPropagation = (self) => Effect.retry(self, {
    while: (e) => e._tag === "ValidationException",
    schedule: Schedule.max([Schedule.spaced("5 seconds"), Schedule.recurs(12)]),
});
const waitForIndexStatus = (id, target) => retryWhileNotReady(Effect.gen(function* () {
    const described = yield* kendra
        .describeIndex({ Id: id })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    if (target === "DELETED") {
        if (described === undefined)
            return;
        return yield* Effect.fail(new IndexNotReady({ id, status: described.Status }));
    }
    if (described?.Status === "ACTIVE")
        return;
    if (described?.Status === "FAILED") {
        return yield* Effect.fail(new IndexProvisioningFailed({ id, message: described.ErrorMessage }));
    }
    return yield* Effect.fail(new IndexNotReady({ id, status: described?.Status }));
}));
const currentArnOf = Effect.gen(function* () {
    const { accountId, region } = yield* AWSEnvironment.current;
    return (indexId) => `arn:aws:kendra:${region}:${accountId}:index/${indexId}`;
});
export const IndexProvider = () => Provider.effect(Index, Effect.gen(function* () {
    return {
        stables: ["id", "arn"],
        list: () => Effect.gen(function* () {
            const arnOf = yield* currentArnOf;
            const summaries = yield* kendra.listIndices.pages({}).pipe(EffectStream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.IndexConfigurationSummaryItems ?? [])));
            const hydrated = yield* Effect.forEach(summaries.flatMap((s) => (s.Id ? [s.Id] : [])), (indexId) => readIndexById(indexId, arnOf), { concurrency: 5 });
            return hydrated.flatMap((state) => state === undefined ? [] : [state.attrs]);
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const arnOf = yield* currentArnOf;
            const state = output?.id
                ? yield* readIndexById(output.id, arnOf)
                : yield* findIndexByName(yield* createIndexName(id, olds ?? {}), arnOf);
            if (!state)
                return undefined;
            return (yield* hasAlchemyTags(id, state.attrs.tags))
                ? state.attrs
                : Unowned(state.attrs);
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return;
            if (olds === undefined)
                return;
            // Edition and encryption-at-rest are fixed at creation.
            if ((olds.edition ?? "DEVELOPER_EDITION") !==
                (news.edition ?? "DEVELOPER_EDITION") ||
                olds.serverSideEncryption?.kmsKeyId !==
                    news.serverSideEncryption?.kmsKeyId) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            if (!news) {
                return yield* Effect.fail(new Error("Kendra Index requires props"));
            }
            const arnOf = yield* currentArnOf;
            const name = yield* createIndexName(id, news);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // Observe — prefer the cached id; fall back to a name lookup so a
            // create whose state failed to persist is adopted, not duplicated.
            let state = output?.id
                ? yield* readIndexById(output.id, arnOf)
                : yield* findIndexByName(name, arnOf);
            // Ensure — create if missing, then wait for ACTIVE.
            if (state === undefined) {
                const created = yield* retryThroughIamPropagation(kendra.createIndex({
                    Name: name,
                    Edition: news.edition ?? "DEVELOPER_EDITION",
                    RoleArn: news.roleArn,
                    Description: news.description,
                    ServerSideEncryptionConfiguration: news.serverSideEncryption
                        ? { KmsKeyId: news.serverSideEncryption.kmsKeyId }
                        : undefined,
                    UserContextPolicy: news.userContextPolicy,
                    UserTokenConfigurations: news.userTokenConfigurations,
                    UserGroupResolutionConfiguration: news.userGroupResolutionConfiguration,
                    Tags: Object.entries(desiredTags).map(([Key, Value]) => ({
                        Key,
                        Value,
                    })),
                }));
                if (!created.Id) {
                    return yield* Effect.fail(new Error(`CreateIndex for '${name}' returned no Id`));
                }
                yield* session.note(`Creating index ${name} (${created.Id})...`);
                yield* waitForIndexStatus(created.Id, "ACTIVE");
                state = yield* readIndexById(created.Id, arnOf);
                if (state === undefined) {
                    return yield* Effect.fail(new Error(`failed to read created index ${name}`));
                }
            }
            // Sync mutable settings via UpdateIndex — only send drifted fields.
            const described = state.described;
            const desiredCapacity = news.capacityUnits
                ? {
                    StorageCapacityUnits: news.capacityUnits.storageCapacityUnits,
                    QueryCapacityUnits: news.capacityUnits.queryCapacityUnits,
                }
                : undefined;
            const capacityDrifted = desiredCapacity !== undefined &&
                (desiredCapacity.StorageCapacityUnits !==
                    described.CapacityUnits?.StorageCapacityUnits ||
                    desiredCapacity.QueryCapacityUnits !==
                        described.CapacityUnits?.QueryCapacityUnits);
            const needsUpdate = name !== described.Name ||
                news.roleArn !== described.RoleArn ||
                (news.description ?? "") !== (described.Description ?? "") ||
                (news.userContextPolicy !== undefined &&
                    news.userContextPolicy !== described.UserContextPolicy) ||
                (news.userGroupResolutionConfiguration !== undefined &&
                    news.userGroupResolutionConfiguration.UserGroupResolutionMode !==
                        described.UserGroupResolutionConfiguration
                            ?.UserGroupResolutionMode) ||
                news.userTokenConfigurations !== undefined ||
                capacityDrifted;
            if (needsUpdate) {
                yield* kendra.updateIndex({
                    Id: state.attrs.id,
                    Name: name,
                    RoleArn: news.roleArn,
                    Description: news.description,
                    UserContextPolicy: news.userContextPolicy,
                    UserTokenConfigurations: news.userTokenConfigurations,
                    UserGroupResolutionConfiguration: news.userGroupResolutionConfiguration,
                    CapacityUnits: desiredCapacity,
                });
                yield* waitForIndexStatus(state.attrs.id, "ACTIVE");
                yield* session.note(`Updated index ${name}`);
            }
            // Sync tags — diff against observed cloud tags.
            const { removed, upsert } = diffTags(state.attrs.tags, desiredTags);
            if (removed.length > 0) {
                yield* kendra.untagResource({
                    ResourceARN: state.attrs.arn,
                    TagKeys: removed,
                });
            }
            if (upsert.length > 0) {
                yield* kendra.tagResource({
                    ResourceARN: state.attrs.arn,
                    Tags: upsert.map(({ Key, Value }) => ({ Key, Value })),
                });
            }
            yield* session.note(state.attrs.arn);
            const final = yield* readIndexById(state.attrs.id, arnOf);
            if (!final) {
                return yield* Effect.fail(new Error(`failed to read reconciled index ${name}`));
            }
            return final.attrs;
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* kendra
                .deleteIndex({ Id: output.id })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            yield* waitForIndexStatus(output.id, "DELETED");
        }),
    };
}));
//# sourceMappingURL=SearchIndex.js.map