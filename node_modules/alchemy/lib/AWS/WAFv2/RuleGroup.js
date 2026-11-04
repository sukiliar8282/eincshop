import * as wafv2 from "@distilled.cloud/aws/wafv2";
import * as Effect from "effect/Effect";
import { Unowned } from "../../AdoptPolicy.js";
import { deepEqual, isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, createTagsList, hasAlchemyTags, } from "../../Tags.js";
import { fetchWafTags, normalizeWafRules, retryAssociatedItem, retryOptimisticLock, retryUnavailableEntity, syncWafTags, withWafScope, } from "./internal.js";
/**
 * An AWS WAFv2 rule group — a reusable, capacity-bounded collection of rules
 * referenced from web ACLs via `RuleGroupReferenceStatement`.
 *
 * The `capacity` (web ACL capacity units, WCU) is fixed at creation;
 * changing it replaces the rule group.
 *
 * ### Creating Rule Groups
 * **Example:** Rule Group with a Byte-Match Rule
 * ```typescript
 * const group = yield* AWS.WAFv2.RuleGroup("BlockAdminPaths", {
 *   capacity: 50,
 *   rules: [
 *     {
 *       Name: "block-admin",
 *       Priority: 0,
 *       Statement: {
 *         ByteMatchStatement: {
 *           SearchString: new TextEncoder().encode("/admin"),
 *           FieldToMatch: { UriPath: {} },
 *           TextTransformations: [{ Priority: 0, Type: "LOWERCASE" }],
 *           PositionalConstraint: "STARTS_WITH",
 *         },
 *       },
 *       Action: { Block: {} },
 *       VisibilityConfig: {
 *         SampledRequestsEnabled: true,
 *         CloudWatchMetricsEnabled: true,
 *         MetricName: "block-admin",
 *       },
 *     },
 *   ],
 * });
 * ```
 *
 * **Example:** Reference from a Web ACL
 * ```typescript
 * const acl = yield* AWS.WAFv2.WebACL("Firewall", {
 *   rules: [
 *     {
 *       Name: "custom-rules",
 *       Priority: 0,
 *       Statement: {
 *         RuleGroupReferenceStatement: { ARN: group.ruleGroupArn },
 *       },
 *       OverrideAction: { None: {} },
 *       VisibilityConfig: {
 *         SampledRequestsEnabled: true,
 *         CloudWatchMetricsEnabled: true,
 *         MetricName: "custom-rules",
 *       },
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export const RuleGroup = Resource("AWS.WAFv2.RuleGroup");
const defaultScope = "REGIONAL";
const defaultVisibilityConfig = (name) => ({
    SampledRequestsEnabled: true,
    CloudWatchMetricsEnabled: true,
    MetricName: name,
});
const toAttrs = (group, scope) => ({
    ruleGroupName: group.Name,
    ruleGroupId: group.Id,
    ruleGroupArn: group.ARN,
    scope,
    capacity: group.Capacity,
});
export const RuleGroupProvider = () => Provider.effect(RuleGroup, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.ruleGroupName ??
            (yield* createPhysicalName({ id, maxLength: 128 })));
    });
    const findRuleGroup = Effect.fn(function* (scope, name, cachedId) {
        if (cachedId !== undefined) {
            const byId = yield* withWafScope(scope, wafv2
                .getRuleGroup({ Name: name, Scope: scope, Id: cachedId })
                .pipe(Effect.catchTag("WAFNonexistentItemException", () => Effect.succeed(undefined))));
            if (byId?.RuleGroup) {
                return byId;
            }
        }
        let marker;
        for (let page = 0; page < 20; page++) {
            const listed = yield* withWafScope(scope, wafv2.listRuleGroups({
                Scope: scope,
                NextMarker: marker,
                Limit: 100,
            }));
            const summary = listed.RuleGroups?.find((s) => s.Name === name);
            if (summary?.Id !== undefined) {
                return yield* withWafScope(scope, wafv2
                    .getRuleGroup({ Name: name, Scope: scope, Id: summary.Id })
                    .pipe(Effect.catchTag("WAFNonexistentItemException", () => Effect.succeed(undefined))));
            }
            if (!listed.NextMarker || (listed.RuleGroups?.length ?? 0) === 0) {
                break;
            }
            marker = listed.NextMarker;
        }
        return undefined;
    });
    const listScope = Effect.fn(function* (scope) {
        const rows = [];
        let marker;
        for (let page = 0; page < 50; page++) {
            const listed = yield* withWafScope(scope, wafv2.listRuleGroups({
                Scope: scope,
                NextMarker: marker,
                Limit: 100,
            }));
            const summaries = listed.RuleGroups ?? [];
            const details = yield* Effect.forEach(summaries, (summary) => summary.Name !== undefined && summary.Id !== undefined
                ? withWafScope(scope, wafv2
                    .getRuleGroup({
                    Name: summary.Name,
                    Scope: scope,
                    Id: summary.Id,
                })
                    .pipe(Effect.catchTag("WAFNonexistentItemException", () => Effect.succeed(undefined))))
                : Effect.succeed(undefined), { concurrency: 5 });
            for (const detail of details) {
                if (detail?.RuleGroup) {
                    rows.push(toAttrs(detail.RuleGroup, scope));
                }
            }
            if (!listed.NextMarker || summaries.length === 0) {
                break;
            }
            marker = listed.NextMarker;
        }
        return rows;
    });
    return {
        stables: [
            "ruleGroupName",
            "ruleGroupId",
            "ruleGroupArn",
            "scope",
            "capacity",
        ],
        list: () => Effect.gen(function* () {
            const regional = yield* listScope("REGIONAL");
            const cloudfront = yield* listScope("CLOUDFRONT");
            return [...regional, ...cloudfront];
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds ?? {});
            const newName = yield* createName(id, news);
            if (oldName !== newName ||
                (olds?.scope ?? defaultScope) !== (news.scope ?? defaultScope) ||
                olds?.capacity !== news.capacity) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const scope = output?.scope ?? olds?.scope ?? defaultScope;
            const name = output?.ruleGroupName ?? (yield* createName(id, olds ?? {}));
            const found = yield* findRuleGroup(scope, name, output?.ruleGroupId);
            if (!found?.RuleGroup) {
                return undefined;
            }
            const attrs = toAttrs(found.RuleGroup, scope);
            const tags = yield* fetchWafTags(scope, found.RuleGroup.ARN);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const scope = news.scope ?? defaultScope;
            const name = output?.ruleGroupName ?? (yield* createName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            const desiredVisibility = news.visibilityConfig ?? defaultVisibilityConfig(name);
            // props survive engine serialization as plain JSON — restore
            // ByteMatchStatement SearchString blobs to Uint8Array
            const desiredRules = normalizeWafRules(news.rules);
            // 1. Observe.
            let observed = yield* findRuleGroup(scope, name, output?.ruleGroupId);
            // 2. Ensure — tolerate a duplicate-create race and re-read.
            if (!observed?.RuleGroup) {
                yield* retryUnavailableEntity(withWafScope(scope, wafv2
                    .createRuleGroup({
                    Name: name,
                    Scope: scope,
                    Capacity: news.capacity,
                    Rules: desiredRules,
                    VisibilityConfig: desiredVisibility,
                    Description: news.description,
                    CustomResponseBodies: news.customResponseBodies,
                    Tags: createTagsList(desiredTags),
                })
                    .pipe(Effect.catchTag("WAFDuplicateItemException", () => Effect.succeed(undefined)))));
                observed = yield* findRuleGroup(scope, name, undefined);
            }
            if (!observed?.RuleGroup) {
                return yield* Effect.fail(new Error(`Failed to observe RuleGroup '${name}' after create`));
            }
            const group = observed.RuleGroup;
            yield* session.note(group.ARN);
            // 3. Sync rules, visibility and description against OBSERVED state.
            const observedAspects = {
                Rules: group.Rules ?? [],
                VisibilityConfig: group.VisibilityConfig,
                Description: group.Description,
            };
            const desiredAspects = {
                Rules: desiredRules,
                VisibilityConfig: desiredVisibility,
                Description: news.description,
            };
            if (news.customResponseBodies !== undefined) {
                observedAspects.CustomResponseBodies = group.CustomResponseBodies;
                desiredAspects.CustomResponseBodies = news.customResponseBodies;
            }
            if (!deepEqual(observedAspects, desiredAspects, { stripNullish: true })) {
                yield* retryOptimisticLock(Effect.gen(function* () {
                    const fresh = yield* findRuleGroup(scope, name, group.Id);
                    if (!fresh?.RuleGroup || fresh.LockToken === undefined) {
                        return;
                    }
                    yield* retryUnavailableEntity(withWafScope(scope, wafv2.updateRuleGroup({
                        Name: name,
                        Scope: scope,
                        Id: fresh.RuleGroup.Id,
                        Rules: desiredRules,
                        VisibilityConfig: desiredVisibility,
                        Description: news.description,
                        CustomResponseBodies: news.customResponseBodies,
                        LockToken: fresh.LockToken,
                    })));
                }));
            }
            // 3b. Sync tags against OBSERVED cloud tags.
            yield* syncWafTags(scope, group.ARN, desiredTags);
            // 4. Return fresh attributes.
            return toAttrs(group, scope);
        }),
        delete: Effect.fn(function* ({ output }) {
            const scope = output.scope;
            // A rule group still referenced by a web ACL (deletion propagation)
            // surfaces WAFAssociatedItemException — retry through it.
            yield* retryAssociatedItem(retryOptimisticLock(Effect.gen(function* () {
                const found = yield* withWafScope(scope, wafv2
                    .getRuleGroup({
                    Name: output.ruleGroupName,
                    Scope: scope,
                    Id: output.ruleGroupId,
                })
                    .pipe(Effect.catchTag("WAFNonexistentItemException", () => Effect.succeed(undefined))));
                if (!found?.RuleGroup || found.LockToken === undefined) {
                    return;
                }
                yield* withWafScope(scope, wafv2
                    .deleteRuleGroup({
                    Name: output.ruleGroupName,
                    Scope: scope,
                    Id: output.ruleGroupId,
                    LockToken: found.LockToken,
                })
                    .pipe(Effect.catchTag("WAFNonexistentItemException", () => Effect.void)));
            })));
        }),
    };
}));
//# sourceMappingURL=RuleGroup.js.map