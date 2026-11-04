import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
import { type ListenerAction, type ListenerRuleCondition } from "./common.ts";
import type { Listener, ListenerArn } from "./Listener.ts";
export type RuleArn = `arn:aws:elasticloadbalancing:${RegionID}:${AccountID}:listener-rule/${string}`;
declare const ListenerRulePriorityInUse_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ListenerRulePriorityInUse";
} & Readonly<A>;
/**
 * The requested rule priority is already taken by another rule on the same
 * listener. Surfaced instead of the raw `PriorityInUseException` so the
 * failure names the conflicting priority and the fix: rules composed with an
 * auto-derived priority (e.g. `AWS.ECS.Service` shared load balancer rules)
 * should set an explicit `priority` to resolve the collision. The engine
 * never probes for a free slot — priorities stay deterministic.
 */
export declare class ListenerRulePriorityInUse extends ListenerRulePriorityInUse_base<{
    readonly listenerArn: string;
    readonly priority: number;
    readonly message: string;
}> {
}
export interface ListenerRuleProps {
    /** The listener this rule attaches to. Changing it replaces the rule. */
    listenerArn: Input<ListenerArn> | Listener;
    /**
     * The rule priority (1-50000). Lower numbers are evaluated first. Updated in
     * place via `setRulePriorities`.
     */
    priority: number;
    /** The conditions under which the rule matches a request (AND-ed). */
    conditions: ListenerRuleCondition[];
    /** The actions to take when the rule matches. */
    actions: ListenerAction[];
    /** Tags to apply to the rule. */
    tags?: Record<string, string>;
}
export interface ListenerRule extends Resource<"AWS.ELBv2.ListenerRule", ListenerRuleProps, {
    /** The ARN of the rule. */
    ruleArn: RuleArn;
    /** The ARN of the listener the rule is attached to. */
    listenerArn: ListenerArn;
    /** The rule's evaluation priority (lower numbers evaluate first). */
    priority: number;
    /** Whether this is the listener's default rule. */
    isDefault: boolean;
}, never, Providers> {
}
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
export declare const ListenerRule: import("../../Resource.ts").ResourceClass<ListenerRule>;
export declare const ListenerRuleProvider: () => import("effect/Layer").Layer<Provider.Provider<ListenerRule>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=ListenerRule.d.ts.map