import * as Effect from "effect/Effect";
import type { IdMappingWorkflow } from "./IdMappingWorkflow.ts";
import type { MatchingWorkflow } from "./MatchingWorkflow.ts";
/**
 * Shared scaffolding for Entity Resolution HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, makeWorkflowHttpBinding({ … }))` over the builder
 * below. Everything except the operation and the IAM action is boilerplate:
 * all Entity Resolution data-plane operations are scoped to a matching or ID
 * mapping workflow and inject the bound workflow's name as the request's
 * `workflowName` field.
 */
export declare const makeWorkflowHttpBinding: <I extends {
    workflowName: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.EntityResolution.GetMatchId`. */
    tag: string;
    /** The distilled operation; `workflowName` is injected from the resource. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the workflow ARN. */
    actions: readonly string[];
}) => Effect.Effect<(workflow: IdMappingWorkflow | MatchingWorkflow) => Effect.Effect<(request: Omit<I, "workflowName">) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map