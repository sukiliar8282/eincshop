import * as Effect from "effect/Effect";
import type { Workflow } from "./Workflow.ts";
/**
 * Shared scaffolding for the Amazon MWAA Serverless HTTP bindings.
 *
 * Every MWAA Serverless data-plane operation is addressed by a
 * `WorkflowArn`, so every binding is scoped to a bound {@link Workflow}:
 * the deploy-time half grants `actions` on the workflow's ARN (plus the
 * `{workflowArn}/*` wildcard covering run- and task-scoped sub-resources),
 * and the runtime half injects the workflow's ARN into every request.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, makeMwaaServerlessHttpBinding({ … }))`.
 */
export declare const makeMwaaServerlessHttpBinding: <I extends {
    WorkflowArn: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.MWAAServerless.StartWorkflowRun`. */
    tag: string;
    /** The distilled operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the workflow ARN (+ `{arn}/*`). */
    actions: readonly string[];
}) => Effect.Effect<(workflow: Workflow) => Effect.Effect<(request?: Omit<I, "WorkflowArn"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map