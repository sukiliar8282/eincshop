import * as Effect from "effect/Effect";
import type { Role } from "../IAM/Role.ts";
/**
 * Shared scaffolding for AWS Transcribe HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the two
 * builders below. Everything except the operation and the IAM action list is
 * boilerplate: Amazon Transcribe's batch APIs have no resource-level IAM, so
 * every grant is on `*`. The role-bound operations (`StartCallAnalyticsJob`,
 * `StartMedicalScribeJob`, `CreateLanguageModel`) additionally inject the
 * bound data-access role and a scoped `iam:PassRole` grant.
 */
/**
 * Build the impl Effect for a Transcribe operation with no bound resource
 * (start/get/list/delete jobs, vocabulary/filter/category lifecycle, tags).
 * The deploy-time half grants `actions` on `*` — Transcribe batch IAM
 * actions do not support resource-level scoping.
 */
export declare const makeTranscribeHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Transcribe.GetTranscriptionJob`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a role-bound Transcribe operation
 * (`StartCallAnalyticsJob`, `StartMedicalScribeJob`, `CreateLanguageModel`):
 * the binding is constructed with the **data-access role** (the IAM role
 * Amazon Transcribe assumes to read your Amazon S3 media/training data and
 * write results; its trust policy must allow `transcribe.amazonaws.com`).
 * The role's ARN is injected as `DataAccessRoleArn` on every runtime request
 * and the deploy-time half grants `actions` on `*` plus `iam:PassRole` on
 * the role — without the PassRole grant, the operation fails only at runtime
 * with an AccessDenied.
 */
export declare const makeTranscribeRoleHttpBinding: <I extends {
    DataAccessRoleArn?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Transcribe.StartMedicalScribeJob`. */
    tag: string;
    /** The distilled operation; `DataAccessRoleArn` is injected from the role. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<<Rl extends Role>(dataAccessRole: Rl) => Effect.Effect<(request: Omit<I, "DataAccessRoleArn"> & {
    DataAccessRoleArn?: string;
}) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map