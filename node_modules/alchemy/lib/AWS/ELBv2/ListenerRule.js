import * as elbv2 from "@distilled.cloud/aws/elastic-load-balancing-v2";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags } from "../../Tags.js";
import { serializeActions, serializeConditions, } from "./common.js";
/**
 * The requested rule priority is already taken by another rule on the same
 * listener. Surfaced instead of the raw `PriorityInUseException` so the
 * failure names the conflicting priority and the fix: rules composed with an
 * auto-derived priority (e.g. `AWS.ECS.Service` shared load balancer rules)
 * should set an explicit `priority` to resolve the collision. The engine
 * never probes for a free slot — priorities stay deterministic.
 */
export class ListenerRulePriorityInUse extends Data.TaggedError("ListenerRulePriorityInUse") {
}
const priorityInUse = (listenerArn, priority) => new ListenerRulePriorityInUse({
    listenerArn,
    priority,
    message: `Listener rule priority ${priority} is already in use on ${listenerArn}. Set an explicit \`priority\` on the rule to resolve the conflict.`,
});
/**
 * An ELBv2 listener rule. Rules attach to an Application Load Balancer listener
 * and route requests to target groups (or other actions) based on conditions
 * such as host header, path pattern, HTTP header, query string, request method,
 * and source IP.
 * ### Creating a Rule
 * **Example:** Path-based routing
 * ```typescript
 * const rule = yield* ListenerRule("api", {
 *   listenerArn: listener.listenerArn,
 *   priority: 10,
 *   conditions: [{ pathPattern: { values: ["/api/*"] } }],
 *   actions: [
 *     { type: "forward", targetGroups: [{ targetGroupArn: apiTg.targetGroupArn }] },
 *   ],
 * });
 * ```
 *
 * **Example:** Host-header routing
 * ```typescript
 * const rule = yield* ListenerRule("admin", {
 *   listenerArn: listener.listenerArn,
 *   priority: 20,
 *   conditions: [{ hostHeader: { values: ["admin.example.com"] } }],
 *   actions: [
 *     { type: "forward", targetGroups: [{ targetGroupArn: adminTg.targetGroupArn }] },
 *   ],
 * });
 * ```
 *
 * ### Conditions
 * **Example:** Combining query-string and HTTP-header conditions
 * ```typescript
 * const rule = yield* ListenerRule("beta", {
 *   listenerArn: listener.listenerArn,
 *   priority: 30,
 *   conditions: [
 *     { queryString: { values: [{ key: "version", value: "beta" }] } },
 *     { httpHeader: { name: "X-Channel", values: ["internal"] } },
 *   ],
 *   actions: [{ type: "fixedResponse", statusCode: "200", messageBody: "beta" }],
 * });
 * ```
 *
 * @resource
 */
export const ListenerRule = Resource("AWS.ELBv2.ListenerRule");
export const ListenerRuleProvider = () => Provider.succeed(ListenerRule, {
    stables: ["ruleArn", "listenerArn"],
    diff: Effect.fn(function* ({ olds, news }) {
        if (!isResolved(news))
            return;
        // priority is mutable in place via setRulePriorities; only the listener
        // forces replacement.
        if (olds.listenerArn !== news.listenerArn) {
            return { action: "replace" };
        }
    }),
    read: Effect.fn(function* ({ output }) {
        if (!output) {
            return undefined;
        }
        const described = yield* elbv2
            .describeRules({ RuleArns: [output.ruleArn] })
            .pipe(Effect.catchTag("RuleNotFoundException", () => Effect.succeed(undefined)));
        const rule = described?.Rules?.[0];
        if (!rule?.RuleArn) {
            return undefined;
        }
        return {
            ruleArn: rule.RuleArn,
            listenerArn: output.listenerArn,
            priority: Number(rule.Priority ?? output.priority),
            isDefault: rule.IsDefault ?? false,
        };
    }),
    // Rules belong to a listener, which belongs to a load balancer. Enumerate
    // every load balancer, then every listener, then every rule.
    list: Effect.fn(function* () {
        const loadBalancerArns = yield* elbv2.describeLoadBalancers
            .pages({})
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.LoadBalancers ?? []).flatMap((lb) => lb.LoadBalancerArn ? [lb.LoadBalancerArn] : []))));
        const listenerArns = yield* Effect.forEach(loadBalancerArns, (loadBalancerArn) => elbv2.describeListeners
            .pages({ LoadBalancerArn: loadBalancerArn })
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.Listeners ?? []).flatMap((l) => l.ListenerArn ? [l.ListenerArn] : []))), Effect.catchTag("LoadBalancerNotFoundException", () => Effect.succeed([])), Effect.catchTag("ListenerNotFoundException", () => Effect.succeed([]))), { concurrency: 10 });
        const rows = yield* Effect.forEach(listenerArns.flat(), (listenerArn) => elbv2.describeRules.items({ ListenerArn: listenerArn }).pipe(Stream.filter((r) => r.RuleArn != null && !r.IsDefault), Stream.map((rule) => ({
            ruleArn: rule.RuleArn,
            listenerArn,
            priority: Number(rule.Priority ?? 0),
            isDefault: rule.IsDefault ?? false,
        })), Stream.runCollect, Effect.map((chunk) => Array.from(chunk)), Effect.catchTag("ListenerNotFoundException", () => Effect.succeed([])), Effect.catchTag("RuleNotFoundException", () => Effect.succeed([]))), { concurrency: 10 });
        const result = rows.flat();
        return result;
    }),
    reconcile: Effect.fn(function* ({ id, news, output, session }) {
        const listenerArn = news.listenerArn;
        const desiredTags = {
            ...(yield* createInternalTags(id)),
            ...news.tags,
        };
        const conditions = serializeConditions(news.conditions);
        const actions = serializeActions(news.actions);
        // Observe — look up the rule by our prior ARN.
        let rule;
        if (output?.ruleArn) {
            const described = yield* elbv2
                .describeRules({ RuleArns: [output.ruleArn] })
                .pipe(Effect.catchTag("RuleNotFoundException", () => Effect.succeed(undefined)));
            rule = described?.Rules?.[0];
        }
        // Ensure — create if missing.
        if (!rule?.RuleArn) {
            const created = yield* elbv2
                .createRule({
                ListenerArn: listenerArn,
                Priority: news.priority,
                Conditions: conditions,
                Actions: actions,
                Tags: Object.entries(desiredTags).map(([Key, Value]) => ({
                    Key,
                    Value,
                })),
            })
                .pipe(Effect.catchTag("PriorityInUseException", () => Effect.fail(priorityInUse(listenerArn, news.priority))));
            rule = created.Rules?.[0];
            if (!rule?.RuleArn) {
                return yield* Effect.die(new Error("createRule returned no rule"));
            }
        }
        else {
            // Sync conditions + actions — modifyRule fully replaces these lists.
            const modified = yield* elbv2.modifyRule({
                RuleArn: rule.RuleArn,
                Conditions: conditions,
                Actions: actions,
            });
            rule = modified.Rules?.[0] ?? rule;
            // Sync priority — not mutable via modifyRule.
            if (Number(rule.Priority) !== news.priority) {
                yield* elbv2
                    .setRulePriorities({
                    RulePriorities: [
                        { RuleArn: rule.RuleArn, Priority: news.priority },
                    ],
                })
                    .pipe(Effect.catchTag("PriorityInUseException", () => Effect.fail(priorityInUse(listenerArn, news.priority))));
            }
        }
        const ruleArn = rule.RuleArn;
        // Sync tags — diff observed cloud tags against desired.
        const tagDescriptions = yield* elbv2.describeTags({
            ResourceArns: [ruleArn],
        });
        const observedTags = Object.fromEntries((tagDescriptions.TagDescriptions?.[0]?.Tags ?? [])
            .filter((t) => typeof t.Key === "string" && typeof t.Value === "string")
            .map((t) => [t.Key, t.Value]));
        const { removed, upsert } = diffTags(observedTags, desiredTags);
        if (upsert.length > 0) {
            yield* elbv2.addTags({ ResourceArns: [ruleArn], Tags: upsert });
        }
        if (removed.length > 0) {
            yield* elbv2.removeTags({ ResourceArns: [ruleArn], TagKeys: removed });
        }
        yield* session.note(ruleArn);
        return {
            ruleArn: ruleArn,
            listenerArn,
            priority: news.priority,
            isDefault: rule.IsDefault ?? false,
        };
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* elbv2
            .deleteRule({ RuleArn: output.ruleArn })
            .pipe(Effect.catchTag("RuleNotFoundException", () => Effect.void));
    }),
});
//# sourceMappingURL=ListenerRule.js.map