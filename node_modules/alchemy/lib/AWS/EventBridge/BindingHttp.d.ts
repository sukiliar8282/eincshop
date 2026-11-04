import * as Effect from "effect/Effect";
import type { EventBus } from "./EventBus.ts";
import type { Rule } from "./Rule.ts";
/**
 * Shared scaffolding for the EventBridge runtime bindings.
 *
 * NOT exported from `index.ts` — every single-operation `{Op}Http.ts` in
 * this service is a thin `Layer.effect(Cap, makeEventBridge…HttpBinding({ … }))`
 * over one of the three builders below. Everything except the operation, the
 * IAM action list, and the injected identifier(s) is boilerplate:
 *
 * - {@link makeEventBridgeAccountHttpBinding} — account-level operations
 *   (`ListEventBuses`, `TestEventPattern`, `ListRuleNamesByTarget`, replay
 *   reads). The runtime callable passes the caller's request through
 *   unchanged; the deploy-time half grants `actions` on `resources`
 *   (default `*` — most EventBridge list/test actions do not support
 *   resource-level permissions).
 * - {@link makeEventBridgeBusHttpBinding} — operations scoped to an optional
 *   bound {@link EventBus} (`DescribeEventBus`, `ListRules`). The runtime
 *   callable injects the bus name under `busNameKey` (omitted for the
 *   default bus); the deploy-time half grants `actions` on the bus ARN, or
 *   the account default bus ARN when no bus is bound.
 * - {@link makeEventBridgeRuleHttpBinding} — operations scoped to a bound
 *   {@link Rule} (`DescribeRule`, `ListTargetsByRule`, `EnableRule`,
 *   `DisableRule`). The runtime callable injects the rule name under
 *   `ruleNameKey` and the bus name under `EventBusName` (omitted for the
 *   default bus); the deploy-time half grants `actions` on the rule ARN.
 *
 * Genuinely-different bindings stay bespoke: `PutEvents` (per-entry bus-name
 * injection), `BusSink` (a batching sink over `PutEvents`), and
 * `StartReplay` (archive-scoped with a replay-wildcard grant).
 */
/**
 * Build the impl Effect for an account-level EventBridge operation. The
 * runtime callable passes the caller's request through unchanged; the
 * deploy-time half grants `actions` on `resources` (default `*`).
 */
export declare const makeEventBridgeAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.EventBridge.ListEventBuses`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `resources`. */
    actions: readonly string[];
    /**
     * Resolve the IAM resources the actions are granted on, given the ambient
     * account and region (e.g. a `replay/*` ARN). Defaults to `["*"]`.
     */
    resources?: (env: {
        accountId: string;
        region: string;
    }) => readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an EventBridge operation scoped to an optional
 * bound {@link EventBus}. The runtime callable injects the bus name under
 * `busNameKey` (omitted for the default bus); the deploy-time half grants
 * `actions` on the bus ARN, or the account default bus ARN when no bus is
 * bound.
 */
export declare const makeEventBridgeBusHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.EventBridge.DescribeEventBus`. */
    tag: string;
    /** The distilled operation; the bus name is injected from the bound bus. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the bus ARN. */
    actions: readonly string[];
    /** Request field the bound bus's name is injected under. */
    busNameKey: string;
    /**
     * Override the IAM resources the actions are granted on. Some bus-scoped
     * operations (`events:ListRules`) do not support resource-level
     * permissions and must be granted on `*`; the default is the bound bus's
     * ARN (or the account default bus ARN when no bus is bound).
     */
    resources?: (env: {
        accountId: string;
        region: string;
    }) => readonly string[];
}) => Effect.Effect<(bus?: EventBus | undefined) => Effect.Effect<(request?: Partial<I> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an EventBridge operation scoped to a bound
 * {@link Rule}. The runtime callable injects the rule name under
 * `ruleNameKey` and the rule's bus name under `EventBusName` (omitted for
 * the default bus); the deploy-time half grants `actions` on the rule ARN.
 */
export declare const makeEventBridgeRuleHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.EventBridge.DescribeRule`. */
    tag: string;
    /** The distilled operation; the rule and bus names are injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the rule ARN. */
    actions: readonly string[];
    /** Request field the bound rule's name is injected under. */
    ruleNameKey: string;
}) => Effect.Effect<(rule: Rule) => Effect.Effect<(request?: Partial<I> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map