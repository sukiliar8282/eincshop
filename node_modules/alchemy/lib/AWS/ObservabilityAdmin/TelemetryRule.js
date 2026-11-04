import * as logs from "@distilled.cloud/aws/cloudwatch-logs";
import * as ec2 from "@distilled.cloud/aws/ec2";
import * as obs from "@distilled.cloud/aws/observabilityadmin";
import * as Data from "effect/Data";
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
 * A CloudWatch **telemetry rule** (Observability Admin) — automatically
 * enables telemetry (such as VPC flow logs) for AWS resources in your
 * account that match the rule's criteria.
 *
 * The account must be onboarded to CloudWatch telemetry config (see
 * `ObservabilityAdmin.TelemetryConfig`) before rules can be created.
 *
 * ### Creating a Telemetry Rule
 * **Example:** Enable VPC flow logs for the account's VPCs
 * ```typescript
 * import * as ObservabilityAdmin from "alchemy/AWS/ObservabilityAdmin";
 *
 * // Onboard the account to telemetry config first.
 * const telemetry = yield* ObservabilityAdmin.TelemetryConfig("Telemetry");
 *
 * const rule = yield* ObservabilityAdmin.TelemetryRule("FlowLogs", {
 *   resourceType: "AWS::EC2::VPC",
 *   telemetryType: "Logs",
 *   telemetrySourceTypes: ["VPC_FLOW_LOGS"],
 *   destinationConfiguration: {
 *     DestinationType: "cloud-watch-logs",
 *     Retention: "30 days",
 *   },
 * });
 * ```
 *
 * **Example:** Custom flow-log parameters
 * ```typescript
 * const rule = yield* ObservabilityAdmin.TelemetryRule("FlowLogs", {
 *   resourceType: "AWS::EC2::VPC",
 *   telemetryType: "Logs",
 *   telemetrySourceTypes: ["VPC_FLOW_LOGS"],
 *   destinationConfiguration: {
 *     DestinationType: "cloud-watch-logs",
 *     Retention: "90 days",
 *     VPCFlowLogParameters: {
 *       TrafficType: "REJECT",
 *       MaxAggregationInterval: 600,
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export const TelemetryRule = Resource("AWS.ObservabilityAdmin.TelemetryRule");
/** Normalize the wire tag map (values may be undefined) to a plain record. */
const toTagRecord = (tags) => Object.fromEntries(Object.entries(tags ?? {}).filter((entry) => entry[1] !== undefined));
const sameJson = (a, b) => JSON.stringify(a) === JSON.stringify(b);
/**
 * True when any field the desired rule declares differs from the observed
 * rule. Fields the desired rule leaves unset are don't-cares (AWS echoes
 * service defaults for them).
 */
const ruleNeedsUpdate = (desired, observed) => {
    if (observed === undefined)
        return true;
    const observedByKey = new Map(Object.entries(observed));
    return Object.entries(desired).some(([key, value]) => !sameJson(value, observedByKey.get(key)));
};
const vpcFlowLogGroupName = "/aws/vpc";
const isVpcFlowLogRule = (rule) => rule?.ResourceType === "AWS::EC2::VPC" &&
    rule.TelemetryType === "Logs" &&
    rule.TelemetrySourceTypes?.includes("VPC_FLOW_LOGS") === true &&
    rule.DestinationConfiguration?.DestinationType === "cloud-watch-logs";
const isManagedVpcFlowLog = (flowLog) => flowLog.FlowLogId !== undefined &&
    flowLog.ResourceId?.startsWith("vpc-") === true &&
    flowLog.LogGroupName === vpcFlowLogGroupName &&
    flowLog.LogDestinationType === "cloud-watch-logs" &&
    flowLog.Tags?.some((tag) => tag.Key === "CloudWatchTelemetryRuleManaged" && tag.Value === "true") === true;
class TelemetryRuleStillExists extends Data.TaggedError("TelemetryRuleStillExists") {
}
class ManagedVpcFlowLogDeleteFailed extends Data.TaggedError("ManagedVpcFlowLogDeleteFailed") {
}
class ManagedVpcFlowLogsStillExist extends Data.TaggedError("ManagedVpcFlowLogsStillExist") {
}
class ManagedVpcLogGroupStillExists extends Data.TaggedError("ManagedVpcLogGroupStillExists") {
}
const cleanupObservationSchedule = Schedule.max([
    Schedule.fixed("1 second"),
    Schedule.recurs(10),
]);
/** Project props to the wire `TelemetryRule` struct (dropping undefineds). */
const toWireRule = (props) => JSON.parse(JSON.stringify({
    ResourceType: props.resourceType,
    TelemetryType: props.telemetryType,
    TelemetrySourceTypes: props.telemetrySourceTypes,
    DestinationConfiguration: props.destinationConfiguration === undefined
        ? undefined
        : (() => {
            const { Retention, ...rest } = props.destinationConfiguration;
            return {
                ...rest,
                RetentionInDays: toWireDays(Retention),
            };
        })(),
    Scope: props.scope,
    SelectionCriteria: props.selectionCriteria,
    AllowFieldUpdates: props.allowFieldUpdates,
    Regions: props.regions,
    AllRegions: props.allRegions,
}));
export const TelemetryRuleProvider = () => Provider.effect(TelemetryRule, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return props.ruleName ?? (yield* createPhysicalName({ id }));
    });
    const readRule = Effect.fn(function* (identifier) {
        return yield* obs
            .getTelemetryRule({ RuleIdentifier: identifier })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    const waitUntilRuleAbsent = Effect.fn(function* (ruleName) {
        yield* readRule(ruleName).pipe(Effect.flatMap((rule) => rule === undefined
            ? Effect.void
            : Effect.fail(new TelemetryRuleStillExists({ ruleName }))), Effect.retry({
            while: (error) => error._tag === "TelemetryRuleStillExists",
            schedule: cleanupObservationSchedule,
        }));
    });
    const matchingRulesRemain = Effect.fn(function* () {
        const summaries = yield* obs.listTelemetryRules.items({}).pipe(Stream.runCollect, Effect.map((items) => Array.from(items)));
        const rules = yield* Effect.forEach(summaries.flatMap((summary) => summary.RuleName === undefined ? [] : [summary.RuleName]), readRule, { concurrency: 4 });
        return rules.some((rule) => isVpcFlowLogRule(rule?.TelemetryRule));
    });
    const listManagedVpcFlowLogs = () => ec2.describeFlowLogs
        .items({
        Filter: [
            {
                Name: "tag:CloudWatchTelemetryRuleManaged",
                Values: ["true"],
            },
            { Name: "log-group-name", Values: [vpcFlowLogGroupName] },
        ],
    })
        .pipe(Stream.runCollect, Effect.map((items) => Array.from(items).filter(isManagedVpcFlowLog)));
    const waitUntilManagedFlowLogsAbsent = Effect.fn(function* (deletedIds) {
        const deleted = new Set(deletedIds);
        yield* listManagedVpcFlowLogs().pipe(Effect.flatMap((flowLogs) => {
            const remaining = flowLogs
                .map((flowLog) => flowLog.FlowLogId)
                .filter((flowLogId) => deleted.has(flowLogId));
            return remaining.length === 0
                ? Effect.void
                : Effect.fail(new ManagedVpcFlowLogsStillExist({
                    flowLogIds: remaining,
                }));
        }), Effect.retry({
            while: (error) => error._tag === "ManagedVpcFlowLogsStillExist",
            schedule: cleanupObservationSchedule,
        }));
    });
    const waitUntilVpcLogGroupAbsent = logs
        .describeLogGroups({
        logGroupNamePrefix: vpcFlowLogGroupName,
        limit: 1,
    })
        .pipe(Effect.flatMap((response) => response.logGroups?.some((group) => group.logGroupName === vpcFlowLogGroupName) === true
        ? Effect.fail(new ManagedVpcLogGroupStillExists({
            logGroupName: vpcFlowLogGroupName,
        }))
        : Effect.void), Effect.retry({
        while: (error) => error._tag === "ManagedVpcLogGroupStillExists",
        schedule: cleanupObservationSchedule,
    }));
    const cleanupManagedVpcFlowLogs = Effect.fn(function* () {
        const managed = yield* listManagedVpcFlowLogs();
        const flowLogIds = managed.map((flowLog) => flowLog.FlowLogId);
        if (flowLogIds.length > 0) {
            yield* ec2.deleteFlowLogs({ FlowLogIds: flowLogIds }).pipe(Effect.flatMap((response) => {
                const failures = (response.Unsuccessful ?? []).filter((failure) => failure.Error?.Code !== "InvalidFlowLogId.NotFound");
                return failures.length === 0
                    ? Effect.void
                    : Effect.fail(new ManagedVpcFlowLogDeleteFailed({ failures }));
            }), Effect.retry({
                while: (error) => error._tag === "ManagedVpcFlowLogDeleteFailed",
                schedule: cleanupObservationSchedule,
            }));
            yield* waitUntilManagedFlowLogsAbsent(flowLogIds);
        }
        // `/aws/vpc` is shared by all Observability Admin-managed VPC flow
        // logs. Delete it only after no flow log of any ownership still uses
        // the destination; otherwise deleting the group would destroy user
        // logs or another rule's delivery target.
        const groupConsumers = yield* ec2.describeFlowLogs
            .items({
            Filter: [{ Name: "log-group-name", Values: [vpcFlowLogGroupName] }],
        })
            .pipe(Stream.runCollect);
        if (groupConsumers.length > 0)
            return;
        yield* logs.deleteLogGroup({ logGroupName: vpcFlowLogGroupName }).pipe(Effect.retry({
            while: (error) => error._tag === "OperationAbortedException" ||
                error._tag === "ServiceUnavailableException",
            schedule: cleanupObservationSchedule,
        }), Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        yield* waitUntilVpcLogGroupAbsent;
    });
    const readTags = Effect.fn(function* (ruleArn) {
        return yield* obs.listTagsForResource({ ResourceARN: ruleArn }).pipe(Effect.map((r) => toTagRecord(r.Tags)), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed({})));
    });
    const toAttrs = (rule, tags) => ({
        ruleName: rule.RuleName ?? "",
        ruleArn: rule.RuleArn ?? "",
        telemetryType: rule.TelemetryRule?.TelemetryType,
        resourceType: rule.TelemetryRule?.ResourceType,
        tags,
    });
    const readAttrs = Effect.fn(function* (identifier) {
        const rule = yield* readRule(identifier);
        if (rule === undefined || rule.RuleArn === undefined)
            return undefined;
        const tags = yield* readTags(rule.RuleArn);
        return toAttrs(rule, tags);
    });
    return TelemetryRule.Provider.of({
        stables: ["ruleName", "ruleArn"],
        list: () => obs.listTelemetryRules.items({}).pipe(Stream.runCollect, Effect.flatMap((summaries) => Effect.forEach(Array.from(summaries).flatMap((s) => s.RuleName === undefined ? [] : [s.RuleName]), (name) => readAttrs(name), { concurrency: 4 })), Effect.map((attrs) => attrs.flatMap((a) => (a === undefined ? [] : [a])))),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.ruleName ?? (yield* createName(id, olds ?? {}));
            const attrs = yield* readAttrs(name);
            if (attrs === undefined)
                return undefined;
            return (yield* hasAlchemyTags(id, attrs.tags))
                ? attrs
                : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            // The name is the only immutable property; the rule configuration
            // is updatable in place via UpdateTelemetryRule.
            if ((yield* createName(id, olds)) !== (yield* createName(id, news))) {
                return { action: "replace" };
            }
            return undefined;
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const props = news;
            const name = output?.ruleName ?? (yield* createName(id, props));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...props.tags, ...internalTags };
            const desiredRule = toWireRule(props);
            // 1. Observe — cloud state is authoritative.
            let observed = yield* readRule(name);
            // 2. Ensure — create if missing; a ConflictException means a peer
            //    created the same-named rule concurrently, so re-observe.
            if (observed === undefined) {
                yield* obs
                    .createTelemetryRule({
                    RuleName: name,
                    Rule: desiredRule,
                    Tags: desiredTags,
                })
                    .pipe(Effect.catchTag("ConflictException", () => Effect.void));
                // The read-after-create is eventually consistent; wait (bounded)
                // for the rule to materialize.
                observed = yield* readRule(name).pipe(Effect.flatMap((rule) => rule === undefined
                    ? Effect.fail(new Error(`telemetry rule '${name}' not yet visible`))
                    : Effect.succeed(rule)), Effect.retry({
                    schedule: Schedule.max([
                        Schedule.fixed("2 seconds"),
                        Schedule.recurs(8),
                    ]),
                }));
            }
            else if (ruleNeedsUpdate(desiredRule, observed.TelemetryRule)) {
                // 3. Sync — UpdateTelemetryRule replaces the whole rule config;
                //    apply only on an actual delta against OBSERVED state.
                yield* obs.updateTelemetryRule({
                    RuleIdentifier: name,
                    Rule: desiredRule,
                });
                observed = (yield* readRule(name)) ?? observed;
            }
            // 3b. Sync tags — diff against OBSERVED cloud tags.
            const ruleArn = observed.RuleArn;
            const observedTags = yield* readTags(ruleArn);
            const { removed, upsert } = diffTags(observedTags, desiredTags);
            if (upsert.length > 0) {
                yield* obs.tagResource({
                    ResourceARN: ruleArn,
                    Tags: Object.fromEntries(upsert.map((t) => [t.Key, t.Value])),
                });
            }
            if (removed.length > 0) {
                yield* obs.untagResource({
                    ResourceARN: ruleArn,
                    TagKeys: removed,
                });
            }
            yield* session.note(name);
            const tags = yield* readTags(ruleArn);
            return toAttrs(observed, tags);
        }),
        delete: Effect.fn(function* ({ output, olds }) {
            // Capture the live rule before deleting it so adoption and drift do
            // not make cleanup decisions from stale desired state.
            const observed = yield* readRule(output.ruleName);
            const deletedRule = observed?.TelemetryRule ??
                (olds === undefined ? undefined : toWireRule(olds));
            yield* obs
                .deleteTelemetryRule({ RuleIdentifier: output.ruleName })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            yield* waitUntilRuleAbsent(output.ruleName);
            // Observability Admin asynchronously creates EC2 flow logs and the
            // shared `/aws/vpc` destination for VPC_FLOW_LOGS rules, but deleting
            // the rule does not remove them. Reap only when this was such a rule
            // and no other live rule can own the shared managed resources.
            if (isVpcFlowLogRule(deletedRule) &&
                !(yield* matchingRulesRemain())) {
                yield* cleanupManagedVpcFlowLogs();
            }
        }),
    });
}));
//# sourceMappingURL=TelemetryRule.js.map