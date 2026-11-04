import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type { Input } from "../Input.ts";
import type { ApiToken } from "./ApiToken.ts";
import type { Dataset } from "./Dataset.ts";
/**
 * A resource passed to the layer: either the module-scope declaration (an
 * Effect that resolves to the instance, same as what capability bindings
 * accept) or an already-yielded instance.
 */
export type ResourceInput<T> = T | Effect.Effect<T, never, any>;
/**
 * Options for {@link Telemetry}: an ingest {@link ApiToken} plus one
 * {@link Dataset} per OTel signal to export.
 */
export interface AxiomTelemetryProps {
    /**
     * The ingest credential. Must have `ingest: ["create"]` capability on
     * every dataset passed below.
     */
    token: ResourceInput<ApiToken>;
    /** Dataset (kind `otel:traces:v1`) to export traces into. */
    traces?: ResourceInput<Dataset> | undefined;
    /** Dataset (kind `otel:logs:v1`) to export logs into. */
    logs?: ResourceInput<Dataset> | undefined;
    /** Dataset (kind `otel:metrics:v1`) to export metrics into. */
    metrics?: ResourceInput<Dataset> | undefined;
    /**
     * The exported `service.name`.
     * @default the deployed Function/Worker's physical name
     */
    serviceName?: Input<string> | undefined;
}
/**
 * Export a Function/Worker's telemetry to Axiom.
 *
 * A binding layer over {@link layerOtlp | Alchemy.Telemetry.layerOtlp}:
 * building it binds each dataset's OTLP endpoint and the ingest token's
 * `Authorization` header (as a secret) onto the host, and at runtime the
 * built-in exporter ships each signal to its dataset, flushed per event.
 *
 * Compose it into the Function/Worker's single `Effect.provide`:
 *
 * ```ts
 * import * as Axiom from "alchemy/Axiom";
 * import { Bucket } from "./bucket.ts";
 * import { Ingest, Logs, Traces } from "./observability.ts";
 *
 * export default Cloudflare.Worker(
 *   "Worker",
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     // ...
 *   }).pipe(
 *     Effect.provide(
 *       Layer.mergeAll(
 *         Cloudflare.R2.ReadWriteBucketBinding,
 *         Axiom.Telemetry({ token: Ingest, traces: Traces, logs: Logs }),
 *       ),
 *     ),
 *   ),
 * );
 * ```
 */
export declare const Telemetry: (props: AxiomTelemetryProps) => Layer.Layer<never>;
//# sourceMappingURL=Telemetry.d.ts.map