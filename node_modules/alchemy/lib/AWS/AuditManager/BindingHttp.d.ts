import * as Effect from "effect/Effect";
import type { Assessment } from "./Assessment.ts";
/**
 * Shared scaffolding for Audit Manager HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the two
 * builders below. Everything except the operation, the IAM action list, and
 * (for assessment-scoped operations) the injected `assessmentId` is
 * boilerplate.
 */
/**
 * Build the impl Effect for an assessment-scoped operation: the runtime
 * callable injects the bound {@link Assessment}'s id as `assessmentId` and
 * the deploy-time half grants `actions` on the assessment ARN.
 */
export declare const makeAssessmentScopedHttpBinding: <I extends {
    assessmentId: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.AuditManager.GetEvidence`. */
    tag: string;
    /** The distilled operation; `assessmentId` is injected from the resource. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the assessment ARN. */
    actions: readonly string[];
}) => Effect.Effect<(assessment: Assessment) => Effect.Effect<(request?: Omit<I, "assessmentId"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an account-level operation (no target assessment
 * — registration status, account-wide insights, report listings, presigned
 * evidence-upload URLs). The deploy-time half grants `actions` on `*`
 * because these IAM actions do not support resource-level scoping.
 */
export declare const makeAuditManagerAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.AuditManager.GetInsights`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map