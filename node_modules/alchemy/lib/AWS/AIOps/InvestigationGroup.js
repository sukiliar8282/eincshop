import * as aiops from "@distilled.cloud/aws/aiops";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags } from "../../Tags.js";
import { toWireDays } from "../../Util/Duration.js";
/**
 * A CloudWatch investigations *investigation group* — the one-time,
 * per-Region container that configures who can run AI-assisted operational
 * investigations, which IAM role is used to access telemetry, how long
 * investigation data is retained, and how it is encrypted.
 *
 * You can have at most one investigation group per Region in an account, so
 * replacements are performed delete-first.
 * ### Creating an Investigation Group
 * **Example:** Basic Investigation Group
 * ```typescript
 * import * as AIOps from "alchemy/AWS/AIOps";
 * import * as IAM from "alchemy/AWS/IAM";
 *
 * const role = yield* IAM.Role("InvestigationsRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Effect: "Allow",
 *       Principal: { Service: "aiops.amazonaws.com" },
 *       Action: ["sts:AssumeRole"],
 *     }],
 *   },
 *   managedPolicyArns: ["arn:aws:iam::aws:policy/AIOpsAssistantPolicy"],
 * });
 *
 * const group = yield* AIOps.InvestigationGroup("Investigations", {
 *   roleArn: role.roleArn,
 * });
 * ```
 *
 * **Example:** Short Retention and Tag Boundaries
 * ```typescript
 * const group = yield* AIOps.InvestigationGroup("Investigations", {
 *   roleArn: role.roleArn,
 *   retention: "7 days",
 *   tagKeyBoundaries: ["Application"],
 *   tags: { Environment: "test" },
 * });
 * ```
 *
 * ### Resource Policy
 * **Example:** Let CloudWatch Alarms Start Investigations
 * ```typescript
 * const group = yield* AIOps.InvestigationGroup("Investigations", {
 *   roleArn: role.roleArn,
 *   policy: [{
 *     Effect: "Allow",
 *     Principal: { Service: "aiops.alarms.cloudwatch.amazonaws.com" },
 *     Action: ["aiops:CreateInvestigation", "aiops:CreateInvestigationEvent"],
 *     Resource: "*",
 *     Condition: {
 *       StringEquals: { "aws:SourceAccount": "111122223333" },
 *       ArnLike: { "aws:SourceArn": "arn:aws:cloudwatch:us-east-1:111122223333:alarm:*" },
 *     },
 *   }],
 * });
 * ```
 *
 * @resource
 */
export const InvestigationGroup = Resource("AWS.AIOps.InvestigationGroup");
/**
 * Bounded retry for `createInvestigationGroup` while the freshly created IAM
 * role propagates — AIOps validates that it can assume the role at create
 * time, which surfaces as a ValidationException/AccessDeniedException that
 * mentions the role for the first seconds of the role's life.
 *
 * Explicitly annotated so the conditional `Retry.Return` type never leaks
 * into declaration emit (it would widen `AWS.providers()` for consumers).
 */
const retryWhileRolePropagates = (self) => Effect.retry(self, {
    while: (e) => (e._tag === "ValidationException" ||
        e._tag === "AccessDeniedException") &&
        /role/i.test(e.message ?? ""),
    schedule: Schedule.max([Schedule.fixed("3 seconds"), Schedule.recurs(8)]),
});
const sameStringArray = (l, r) => l.length === r.length && l.every((v, i) => v === r[i]);
export const InvestigationGroupProvider = () => Provider.effect(InvestigationGroup, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return props.name ?? (yield* createPhysicalName({ id, maxLength: 64 }));
    });
    const observeByArn = (arn) => aiops
        .getInvestigationGroup({ identifier: arn })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    // At most one investigation group exists per Region, so scanning the
    // list for our name is a single cheap call.
    const findArnByName = (name) => aiops.listInvestigationGroups.items({}).pipe(Stream.runCollect, Effect.map((items) => Array.from(items).find((g) => g.name === name)?.arn));
    const observe = Effect.fn(function* (name, arnHint) {
        if (arnHint !== undefined) {
            const found = yield* observeByArn(arnHint);
            if (found !== undefined)
                return found;
        }
        const arn = yield* findArnByName(name);
        return arn === undefined ? undefined : yield* observeByArn(arn);
    });
    const observedTags = (arn) => aiops.listTagsForResource({ resourceArn: arn }).pipe(Effect.map((r) => {
        const tags = {};
        for (const [key, value] of Object.entries(r.tags ?? {})) {
            if (value !== undefined)
                tags[key] = value;
        }
        return tags;
    }), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed({})));
    const toAttributes = (live) => ({
        name: live.name,
        arn: live.arn,
        roleArn: live.roleArn,
        retentionInDays: live.retentionInDays,
    });
    return InvestigationGroup.Provider.of({
        stables: ["name", "arn"],
        list: () => Effect.gen(function* () {
            const items = yield* aiops.listInvestigationGroups
                .items({})
                .pipe(Stream.runCollect);
            const groups = [];
            for (const item of Array.from(items)) {
                if (item.arn === undefined)
                    continue;
                const live = yield* observeByArn(item.arn);
                if (live?.arn !== undefined && live.name !== undefined) {
                    groups.push(toAttributes(live));
                }
            }
            return groups;
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.name ?? (yield* createName(id, olds ?? {}));
            const live = yield* observe(name, output?.arn);
            if (live?.arn === undefined || live.name === undefined) {
                return undefined;
            }
            const attrs = toAttributes(live);
            const tags = yield* observedTags(live.arn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds ?? {});
            const newName = yield* createName(id, news ?? {});
            // Only one investigation group may exist per Region, so a
            // replacement must delete the old group before creating the new.
            if (oldName !== newName) {
                return { action: "replace", deleteFirst: true };
            }
            // The retention period has no update API — replace to change it.
            if (toWireDays(olds?.retention) !== toWireDays(news?.retention)) {
                return { action: "replace", deleteFirst: true };
            }
            // fall through: engine default update logic for mutable fields
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.name ?? (yield* createName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // 1. OBSERVE — cloud state is authoritative; output.arn is only a
            //    cache of the identifier.
            let live = yield* observe(name, output?.arn);
            // 2. ENSURE — create when missing. A ConflictException here means
            //    a concurrent create raced us (one group per Region): if a
            //    group with OUR name now exists we converge on it, otherwise
            //    the conflict is a real error (a foreign group occupies the
            //    Region's single slot) and is propagated.
            if (live === undefined) {
                live = yield* aiops
                    .createInvestigationGroup({
                    name,
                    roleArn: news.roleArn,
                    retentionInDays: toWireDays(news.retention),
                    encryptionConfiguration: news.encryptionConfiguration,
                    tagKeyBoundaries: news.tagKeyBoundaries,
                    chatbotNotificationChannel: news.chatbotNotificationChannel,
                    isCloudTrailEventHistoryEnabled: news.isCloudTrailEventHistoryEnabled,
                    crossAccountConfigurations: news.crossAccountConfigurations,
                    tags: desiredTags,
                })
                    .pipe(retryWhileRolePropagates, Effect.flatMap((created) => created.arn === undefined
                    ? observe(name, undefined)
                    : observeByArn(created.arn)), Effect.catchTag("ConflictException", (error) => observe(name, undefined).pipe(Effect.flatMap((existing) => existing === undefined
                    ? Effect.fail(error)
                    : Effect.succeed(existing)))));
            }
            const arn = live?.arn ?? output?.arn;
            // 3. SYNC — diff each OBSERVED mutable aspect against the desired
            //    state and PATCH only on drift. Aspects the user leaves
            //    undefined are unmanaged (left as observed).
            if (live !== undefined && arn !== undefined) {
                const update = {};
                if (live.roleArn !== news.roleArn) {
                    update.roleArn = news.roleArn;
                }
                if (news.encryptionConfiguration !== undefined &&
                    ((live.encryptionConfiguration?.type ?? "AWS_OWNED_KEY") !==
                        (news.encryptionConfiguration.type ?? "AWS_OWNED_KEY") ||
                        live.encryptionConfiguration?.kmsKeyId !==
                            news.encryptionConfiguration.kmsKeyId)) {
                    update.encryptionConfiguration = news.encryptionConfiguration;
                }
                if (news.tagKeyBoundaries !== undefined &&
                    !sameStringArray(live.tagKeyBoundaries ?? [], news.tagKeyBoundaries)) {
                    update.tagKeyBoundaries = news.tagKeyBoundaries;
                }
                if (news.isCloudTrailEventHistoryEnabled !== undefined &&
                    live.isCloudTrailEventHistoryEnabled !==
                        news.isCloudTrailEventHistoryEnabled) {
                    update.isCloudTrailEventHistoryEnabled =
                        news.isCloudTrailEventHistoryEnabled;
                }
                if (news.chatbotNotificationChannel !== undefined &&
                    JSON.stringify(live.chatbotNotificationChannel ?? {}) !==
                        JSON.stringify(news.chatbotNotificationChannel)) {
                    update.chatbotNotificationChannel =
                        news.chatbotNotificationChannel;
                }
                if (news.crossAccountConfigurations !== undefined &&
                    JSON.stringify(live.crossAccountConfigurations ?? []) !==
                        JSON.stringify(news.crossAccountConfigurations)) {
                    update.crossAccountConfigurations =
                        news.crossAccountConfigurations;
                }
                if (Object.keys(update).length > 0) {
                    yield* aiops.updateInvestigationGroup({
                        identifier: arn,
                        ...update,
                    });
                    live = (yield* observeByArn(arn)) ?? live;
                }
            }
            // 3b. SYNC POLICY — diff the OBSERVED resource policy against the
            //     desired policy document and put/delete only on drift.
            //     `policy: undefined` leaves any existing policy unmanaged;
            //     `policy: []` deletes it.
            if (arn !== undefined && news.policy !== undefined) {
                const observedPolicy = yield* aiops
                    .getInvestigationGroupPolicy({ identifier: arn })
                    .pipe(Effect.map((r) => r.policy), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
                if (news.policy.length === 0) {
                    if (observedPolicy !== undefined) {
                        yield* aiops
                            .deleteInvestigationGroupPolicy({ identifier: arn })
                            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
                    }
                }
                else {
                    const desiredPolicy = JSON.stringify({
                        Version: "2012-10-17",
                        Statement: news.policy,
                    });
                    const inSync = yield* Effect.sync(() => {
                        if (observedPolicy === undefined)
                            return false;
                        try {
                            return (JSON.stringify(JSON.parse(observedPolicy)) === desiredPolicy);
                        }
                        catch {
                            return false;
                        }
                    });
                    if (!inSync) {
                        yield* aiops.putInvestigationGroupPolicy({
                            identifier: arn,
                            policy: desiredPolicy,
                        });
                    }
                }
            }
            // 3c. SYNC TAGS — diff against OBSERVED cloud tags so adoption
            //     converges (create-time tags only apply on first create).
            if (arn !== undefined) {
                const currentTags = yield* observedTags(arn);
                const { upsert, removed } = diffTags(currentTags, desiredTags);
                if (upsert.length > 0) {
                    yield* aiops.tagResource({
                        resourceArn: arn,
                        tags: Object.fromEntries(upsert.map((t) => [t.Key, t.Value])),
                    });
                }
                if (removed.length > 0) {
                    yield* aiops.untagResource({
                        resourceArn: arn,
                        tagKeys: removed,
                    });
                }
            }
            yield* session.note(name);
            return {
                name: live?.name ?? name,
                arn: arn,
                roleArn: live?.roleArn ?? news.roleArn,
                retentionInDays: live?.retentionInDays ?? toWireDays(news.retention),
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* aiops
                .deleteInvestigationGroup({ identifier: output.arn })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=InvestigationGroup.js.map