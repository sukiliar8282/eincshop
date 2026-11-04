/**
 * Shared scaffolding for Amazon OpenSearch Ingestion (OSIS) HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the builders
 * below. Everything except the operation, the injected identifier, and the
 * IAM action list is boilerplate:
 *
 * - Pipeline-scoped operations (`osis:GetPipeline`, `osis:StartPipeline`,
 *   `osis:StopPipeline`, …) inject the bound {@link Pipeline}'s name or ARN
 *   into the request and are granted on the pipeline ARN.
 * - Account-level operations (`osis:ValidatePipeline`,
 *   `osis:ListPipelineBlueprints`, …) take the caller's request as-is and
 *   are granted on `*` — they are not scoped to a single pipeline resource.
 * - The `osis:Ingest` data plane has no distilled operation — it is a
 *   SigV4-signed HTTP POST (service `"osis"`) against the pipeline's ingest
 *   endpoint, made with the host Function's own credentials.
 */
import * as Credentials from "@distilled.cloud/aws/Credentials";
import * as Region from "@distilled.cloud/aws/Region";
import * as Effect from "effect/Effect";
import type * as Output from "../../Output.ts";
import type { Pipeline } from "./Pipeline.ts";
/**
 * Build the impl Effect for an OSIS operation scoped to a {@link Pipeline}:
 * the deploy-time half grants `actions` on the bound pipeline's ARN, and the
 * runtime half injects the pipeline's identifier (name or ARN) as
 * `requestKey` into every request.
 */
export declare const makeOsisPipelineHttpBinding: <I extends object, K extends keyof I & string, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.OSIS.StartPipeline`. */
    tag: string;
    /** The distilled operation; `requestKey` is injected from the pipeline. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the pipeline ARN. */
    actions: readonly string[];
    /** The request field the resolved identifier is injected as. */
    requestKey: K;
    /** Resolve the injected identifier from the bound pipeline. */
    identifier: (pipeline: Pipeline) => Output.Output<string, never>;
}) => Effect.Effect<(pipeline: Pipeline) => Effect.Effect<(request?: Omit<I, K> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an account-level OSIS operation (config
 * validation, blueprint catalog reads, endpoint-connection listing). The
 * deploy-time half grants `actions` on `*` — these operations are not scoped
 * to a single pipeline resource.
 */
export declare const makeOsisAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.OSIS.ValidatePipeline`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
declare const PipelineIngestError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "OsisPipelineIngestError";
} & Readonly<A>;
/**
 * A failed `osis:Ingest` request against a pipeline's ingest endpoint —
 * carries the HTTP status and response body returned by Data Prepper.
 */
export declare class PipelineIngestError extends PipelineIngestError_base<{
    readonly pipelineName: string;
    /** Request path on the ingest endpoint, e.g. `/logs/ingest`. */
    readonly path: string;
    /** HTTP status; `0` when the request never reached the endpoint. */
    readonly status: number;
    readonly body: string;
}> {
}
/** A single `osis:Ingest` request against the pipeline's ingest endpoint. */
export interface IngestRequest {
    /**
     * Path of the pipeline's HTTP source, e.g. `/logs/ingest` — must match the
     * `path` configured on the `http` (or `otel_*`) source in the pipeline
     * configuration body.
     */
    path: string;
    /**
     * Events to ingest, JSON-serialized as the request body. Data Prepper's
     * `http` source expects a JSON array of event objects.
     */
    events: ReadonlyArray<unknown>;
}
/**
 * Build the impl Effect for the `osis:Ingest` data plane: the deploy-time
 * half grants `osis:Ingest` on the bound pipeline's ARN, and the runtime half
 * signs (SigV4, service `"osis"`) and POSTs each batch of events to the
 * pipeline's ingest endpoint with the host Function's own credentials.
 */
export declare const makeOsisIngestBinding: Effect.Effect<(pipeline: Pipeline) => Effect.Effect<(request: IngestRequest) => Effect.Effect<undefined, PipelineIngestError | Credentials.CredentialsError, never>, never, never>, never, Credentials.Credentials | Region.Region>;
export {};
//# sourceMappingURL=BindingHttp.d.ts.map