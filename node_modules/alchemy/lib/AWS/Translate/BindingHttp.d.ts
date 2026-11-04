import * as Effect from "effect/Effect";
import type { Role } from "../IAM/Role.ts";
/**
 * Shared scaffolding for AWS Translate HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the two
 * builders below. Everything except the operation and the IAM action list is
 * boilerplate. The bindings take terminology/parallel-data/job identifiers
 * at runtime (not as bound resources), so grants are on `Resource: ["*"]`.
 */
/**
 * Build the impl Effect for a Translate operation with no bound resource
 * (real-time translation, terminology/parallel-data reads, job
 * describe/list/stop).
 */
export declare const makeTranslateHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Translate.TranslateText`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for `StartTextTranslationJob`: the binding is
 * constructed with the **data-access role** (the IAM role Amazon Translate
 * assumes to read input documents from S3 and write results; its trust
 * policy must allow `translate.amazonaws.com`). The role's ARN is injected
 * as `DataAccessRoleArn` on every runtime request, and the deploy-time half
 * grants `actions` on `*` plus `iam:PassRole` on the role — without the
 * PassRole grant, the start call fails only at runtime with an AccessDenied.
 * `ClientToken` is optional on the runtime request (the AWS SDK also
 * auto-generates it) — a UUID is generated per call when omitted.
 */
export declare const makeTranslateStartJobHttpBinding: <I extends {
    DataAccessRoleArn: string;
    ClientToken: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Translate.StartTextTranslationJob`. */
    tag: string;
    /** The distilled operation; `DataAccessRoleArn` is injected from the role. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<<Rl extends Role>(dataAccessRole: Rl) => Effect.Effect<(request: Omit<I, "ClientToken" | "DataAccessRoleArn"> & {
    DataAccessRoleArn?: string;
    ClientToken?: string;
}) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map