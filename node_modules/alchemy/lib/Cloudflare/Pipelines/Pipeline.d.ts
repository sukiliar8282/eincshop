import * as pipelines from "@distilled.cloud/cloudflare/pipelines";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Pipelines.Pipeline";
type TypeId = typeof TypeId;
export interface PipelineProps {
    /**
     * Name of the pipeline. Unique per account; must be alphanumeric and
     * underscores only. If omitted, a unique name is generated from the
     * app, stage, and logical ID.
     *
     * Pipelines have no update API, so changing this (or the `sql`)
     * triggers a replacement.
     * @default ${app}_${id}_${stage}_${suffix}
     */
    name?: string;
    /**
     * SQL statement describing the processing flow, e.g.
     * `INSERT INTO my_sink SELECT * FROM my_stream`. Streams and sinks are
     * referenced by name — interpolate `stream.name` / `sink.name` outputs
     * so the engine orders the pipeline after them on deploy (and before
     * them on destroy).
     *
     * Immutable — changing the SQL triggers a replacement.
     */
    sql: string;
}
export interface PipelineAttributes {
    /** Cloudflare-assigned pipeline identifier. */
    pipelineId: string;
    /** Account that owns the pipeline. */
    accountId: string;
    /** Pipeline name (unique per account). */
    name: string;
    /** SQL statement of the processing flow. */
    sql: string;
    /** Current status of the pipeline. */
    status: string;
    /** When the pipeline was created. */
    createdAt: string;
    /** When the pipeline was last modified. */
    modifiedAt: string;
}
export type Pipeline = Resource<TypeId, PipelineProps, PipelineAttributes, never, Providers>;
/**
 * A Cloudflare SQL Pipeline — the transform of the Pipelines product. A
 * pipeline is a single SQL statement that reads events from a
 * {@link Stream} and writes them to a {@link Sink}, both
 * referenced by name.
 *
 * The SQL is fixed at creation: changing it (or the name) triggers a
 * replacement. Nothing references a pipeline downstream, so replacements
 * are cheap.
 * ### Creating a Pipeline
 * **Example:** Stream → Sink passthrough
 * ```typescript
 * const stream = yield* Cloudflare.Pipelines.Stream("events", {});
 * const sink = yield* Cloudflare.Pipelines.Sink("events-sink", {
 *   type: "r2",
 *   config: { bucket: bucket.bucketName, credentials },
 * });
 *
 * const pipeline = yield* Cloudflare.Pipelines.Pipeline("etl", {
 *   sql: Output.interpolate`INSERT INTO ${sink.name} SELECT * FROM ${stream.name}`,
 * });
 * ```
 *
 * **Example:** Filtering transform
 * ```typescript
 * const pipeline = yield* Cloudflare.Pipelines.Pipeline("errors-only", {
 *   sql: Output.interpolate`INSERT INTO ${sink.name} SELECT * FROM ${stream.name} WHERE level = 'error'`,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/pipelines/
 *
 * @resource
 * @product Pipelines
 * @category Storage & Databases
 */
export declare const Pipeline: import("../../Resource.ts").ResourceClass<Pipeline>;
/**
 * Returns true if the given value is a Pipeline resource.
 */
export declare const isPipeline: (value: unknown) => value is Pipeline;
export declare const PipelineProvider: () => import("effect/Layer").Layer<Provider.Provider<Pipeline>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | pipelines.CloudflareOpContext>;
export {};
//# sourceMappingURL=Pipeline.d.ts.map