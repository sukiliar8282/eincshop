import * as Effect from "effect/Effect";
import type { PolicyStatement } from "../IAM/Policy.ts";
import type { Transformer } from "./Transformer.ts";
/**
 * Shared scaffolding for B2BI HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the two
 * builders below. Everything except the operation, the IAM action list, and
 * the injected identifier is boilerplate.
 */
/**
 * Build the impl Effect for a transformer-scoped operation: the runtime
 * callable injects the bound {@link Transformer}'s ID as `transformerId` and
 * the deploy-time half grants `actions` on the transformer ARN.
 */
export declare const makeTransformerScopedHttpBinding: <I extends {
    transformerId: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.B2BI.StartTransformerJob`. */
    tag: string;
    /** The distilled operation; `transformerId` is injected from the resource. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the transformer ARN. */
    actions: readonly string[];
    /**
     * Companion statements the operation needs beyond the transformer-scoped
     * b2bi action — B2BI reaches into S3 through the caller's session
     * (forward-access), so e.g. `StartTransformerJob` needs S3 access on the
     * host.
     */
    companionStatements?: readonly PolicyStatement[];
}) => Effect.Effect<(transformer: Transformer) => Effect.Effect<(request: Omit<I, "transformerId">) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an account-level operation (no target resource).
 * The deploy-time half grants `actions` on `*` — B2BI's test/generate
 * operations don't support resource-level scoping.
 */
export declare const makeB2biAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.B2BI.TestMapping`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request: I) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map