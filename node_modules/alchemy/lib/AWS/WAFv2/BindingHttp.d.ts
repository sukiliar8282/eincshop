import * as Effect from "effect/Effect";
import type { IPSet } from "./IPSet.ts";
import { type WafScope } from "./internal.ts";
import type { RuleGroup } from "./RuleGroup.ts";
import type { WebACL } from "./WebACL.ts";
/**
 * Shared scaffolding for AWS WAFv2 HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the builders
 * below. Everything except the operation, the IAM action list, and the
 * injected identifiers is boilerplate:
 *
 * - {@link makeWafv2WebAclHttpBinding} — operations scoped to one bound
 *   {@link WebACL}; `inject` picks which resolved identifiers (ARN, name,
 *   id, scope) the request needs. CLOUDFRONT-scoped web ACLs are pinned to
 *   `us-east-1` automatically.
 * - {@link makeWafv2IPSetHttpBinding} — operations scoped to one bound
 *   {@link IPSet}; injects `Name`/`Scope`/`Id`.
 * - {@link makeWafv2RuleGroupHttpBinding} — operations keyed by a rule
 *   group ARN (the permission-policy interface); injects `ResourceArn`.
 * - {@link makeWafv2AccountHttpBinding} — account-level operations (API
 *   keys, capacity checks, managed rule group catalog); the caller's
 *   request passes through and the grant is on `*`. A `Scope: "CLOUDFRONT"`
 *   request is pinned to `us-east-1`.
 */
/** Identifiers of a bound {@link WebACL}, resolved at request time. */
export interface ResolvedWebAcl {
    readonly arn: string;
    readonly name: string;
    readonly id: string;
    readonly scope: WafScope;
}
/**
 * Build the impl Effect for an operation scoped to a single bound
 * {@link WebACL}. `inject` maps the resolved web ACL identifiers onto the
 * request fields the operation expects; the deploy-time half grants
 * `actions` on the web ACL ARN.
 */
export declare const makeWafv2WebAclHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.WAFv2.GetSampledRequests`. */
    tag: string;
    /** The distilled operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the web ACL ARN. */
    actions: readonly string[];
    /** Request fields injected from the bound web ACL. */
    inject: (webAcl: ResolvedWebAcl) => Partial<I>;
}) => Effect.Effect<(webAcl: WebACL) => Effect.Effect<(request?: Partial<I> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an operation scoped to a single bound
 * {@link IPSet}: the runtime callable injects the IP set's `Name`, `Scope`,
 * and `Id`; the deploy-time half grants `actions` on the IP set ARN.
 * CLOUDFRONT-scoped IP sets are pinned to `us-east-1` automatically.
 */
export declare const makeWafv2IPSetHttpBinding: <I extends {
    Name?: string;
    Scope?: string;
    Id?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.WAFv2.GetIPSet`. */
    tag: string;
    /** The distilled operation; `Name`/`Scope`/`Id` are injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the IP set ARN. */
    actions: readonly string[];
}) => Effect.Effect<(ipSet: IPSet) => Effect.Effect<(request?: Omit<I, "Id" | "Name" | "Scope"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an operation keyed by a bound {@link RuleGroup}
 * ARN (the permission-policy interface): the runtime callable injects the
 * rule group's ARN as `ResourceArn`; the deploy-time half grants `actions`
 * on the rule group ARN. CLOUDFRONT-scoped rule groups are pinned to
 * `us-east-1` automatically.
 */
export declare const makeWafv2RuleGroupHttpBinding: <I extends {
    ResourceArn?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.WAFv2.GetPermissionPolicy`. */
    tag: string;
    /** The distilled operation; `ResourceArn` is injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the rule group ARN. */
    actions: readonly string[];
}) => Effect.Effect<(ruleGroup: RuleGroup) => Effect.Effect<(request?: Omit<I, "ResourceArn"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an account-level WAFv2 operation (API keys,
 * capacity checks, managed rule group catalog reads): the caller's request
 * passes through unchanged and the deploy-time half grants `actions` on
 * `*` (these operations authorize account-wide, not against a resource
 * ARN). A request with `Scope: "CLOUDFRONT"` is pinned to `us-east-1`.
 */
export declare const makeWafv2AccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.WAFv2.CheckCapacity`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map