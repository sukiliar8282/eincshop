import * as vpclattice from "@distilled.cloud/aws/vpc-lattice";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * The match conditions of a listener rule (HTTP method, path, and header
 * matches).
 */
export type RuleMatch = vpclattice.RuleMatch;
/**
 * The action a rule applies to matched traffic: forward to weighted target
 * groups or answer with a fixed HTTP status.
 */
export type RuleAction = vpclattice.RuleAction;
export interface RuleProps {
    /**
     * ID or ARN of the lattice service the rule's listener belongs to.
     * Immutable — changing it replaces the rule.
     */
    serviceIdentifier: string;
    /**
     * ID or ARN of the listener the rule belongs to. Immutable — changing it
     * replaces the rule.
     */
    listenerIdentifier: string;
    /**
     * Name of the rule. If omitted, a unique name is generated. Immutable —
     * changing it replaces the rule.
     */
    name?: string;
    /**
     * Match conditions for the rule, e.g.
     * `{ httpMatch: { pathMatch: { match: { prefix: "/api" } } } }`.
     */
    match: RuleMatch;
    /**
     * Rule priority (1–100). Lower numbers are evaluated first; each rule on a
     * listener must have a unique priority.
     */
    priority: number;
    /**
     * Action applied to matched requests: forward to weighted target groups or
     * return a fixed response status.
     */
    action: RuleAction;
    /**
     * User-defined tags to apply to the rule.
     */
    tags?: Record<string, string>;
}
export interface Rule extends Resource<"AWS.VpcLattice.Rule", RuleProps, {
    /**
     * Service-assigned unique ID of the rule.
     */
    ruleId: string;
    /**
     * ARN of the rule.
     */
    ruleArn: string;
    /**
     * Physical name of the rule.
     */
    name: string;
    /**
     * Current rule priority.
     */
    priority: number;
    /**
     * ID or ARN of the owning lattice service (as configured).
     */
    serviceIdentifier: string;
    /**
     * ID or ARN of the owning listener (as configured).
     */
    listenerIdentifier: string;
    /**
     * Current tags reported for the rule.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon VPC Lattice listener rule — matches HTTP requests by method,
 * path, or headers and forwards them to target groups (or answers with a
 * fixed response), evaluated in priority order before the listener's default
 * action.
 *
 * ### Creating Rules
 * **Example:** Path-Prefix Rule Forwarding to a Target Group
 * ```typescript
 * const rule = yield* Rule("ApiRule", {
 *   serviceIdentifier: service.serviceId,
 *   listenerIdentifier: listener.listenerId,
 *   priority: 10,
 *   match: { httpMatch: { pathMatch: { match: { prefix: "/api" } } } },
 *   action: {
 *     forward: {
 *       targetGroups: [
 *         { targetGroupIdentifier: targets.targetGroupId, weight: 100 },
 *       ],
 *     },
 *   },
 * });
 * ```
 *
 * **Example:** Method Match with a Fixed Response
 * ```typescript
 * const rule = yield* Rule("BlockDeletes", {
 *   serviceIdentifier: service.serviceId,
 *   listenerIdentifier: listener.listenerId,
 *   priority: 1,
 *   match: { httpMatch: { method: "DELETE" } },
 *   action: { fixedResponse: { statusCode: 403 } },
 * });
 * ```
 *
 * @resource
 */
export declare const Rule: import("../../Resource.ts").ResourceClass<Rule>;
export declare const RuleProvider: () => import("effect/Layer").Layer<Provider.Provider<Rule>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Rule.d.ts.map