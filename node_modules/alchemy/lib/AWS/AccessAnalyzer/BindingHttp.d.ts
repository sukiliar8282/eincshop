import * as Effect from "effect/Effect";
import type { Analyzer } from "./Analyzer.ts";
/**
 * Shared scaffolding for AccessAnalyzer HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the two
 * builders below. Everything except the operation, the IAM action list, and
 * (for analyzer-scoped operations) the injected `analyzerArn` is boilerplate.
 */
/**
 * Build the impl Effect for an analyzer-scoped operation: the runtime
 * callable injects the bound {@link Analyzer}'s ARN as `analyzerArn` and the
 * deploy-time half grants `actions` on the analyzer ARN.
 */
export declare const makeAnalyzerScopedHttpBinding: <I extends {
    analyzerArn: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.AccessAnalyzer.ListFindingsV2`. */
    tag: string;
    /** The distilled operation; `analyzerArn` is injected from the analyzer. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the analyzer ARN. */
    actions: readonly string[];
}) => Effect.Effect<(analyzer: Analyzer) => Effect.Effect<(request?: Omit<I, "analyzerArn"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an account-level operation (no target analyzer —
 * the policy-check, policy-validation, and policy-generation APIs). The
 * deploy-time half grants `actions` on `*` because these IAM actions do not
 * support resource-level scoping.
 */
export declare const makeAccessAnalyzerAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.AccessAnalyzer.ValidatePolicy`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map