import * as Effect from "effect/Effect";
import type { Pipeline } from "./Pipeline.ts";
/**
 * Build the impl Effect for an operation that addresses the pipeline via a
 * `name` field (StartPipelineExecution, GetPipelineState): the runtime
 * callable injects the bound {@link Pipeline}'s name and the deploy-time
 * half grants `actions` on the pipeline ARN.
 */
export declare const makeCodePipelineNameHttpBinding: <I extends {
    name?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.CodePipeline.GetPipelineState`. */
    tag: string;
    /** The distilled operation; `name` is injected from the pipeline. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the pipeline ARN. */
    actions: readonly string[];
}) => Effect.Effect<<P extends Pipeline>(pipeline: P) => Effect.Effect<(request?: Omit<I, "name"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an operation that addresses the pipeline via a
 * `pipelineName` field (the majority): the runtime callable injects the
 * bound {@link Pipeline}'s name and the deploy-time half grants `actions`
 * on the pipeline ARN (plus `{pipelineArn}/*` when `subScoped` — stage- and
 * action-addressed operations authorize against sub-resource ARNs).
 */
export declare const makeCodePipelinePipelineNameHttpBinding: <I extends {
    pipelineName?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.CodePipeline.RollbackStage`. */
    tag: string;
    /** The distilled operation; `pipelineName` is injected from the pipeline. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the pipeline ARN. */
    actions: readonly string[];
    /** Also grant on `{pipelineArn}/*` (stage-/action-addressed actions). */
    subScoped?: boolean;
}) => Effect.Effect<<P extends Pipeline>(pipeline: P) => Effect.Effect<(request?: Omit<I, "pipelineName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a job-worker operation (GetJobDetails,
 * PutJobSuccessResult, PutJobFailureResult). CodePipeline job actions do
 * not support resource-level permissions, so the deploy-time half grants
 * `actions` on `*`; the runtime callable passes the request through as-is.
 */
export declare const makeCodePipelineJobHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.CodePipeline.PutJobSuccessResult`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*` (no resource-level permission support). */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request: I) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map