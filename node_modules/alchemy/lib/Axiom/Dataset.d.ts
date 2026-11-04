import * as Axiom from "@distilled.cloud/axiom";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import { Stack } from "../Stack.ts";
import { Stage } from "../Stage.ts";
import type { Providers } from "./Providers.ts";
export type DatasetKind = "otel:metrics:v1" | "otel:traces:v1" | "otel:logs:v1" | "axiom:events:v1" | (string & {});
export type DatasetProps = {
    /**
     * Dataset name. Used as the dataset's stable identifier in Axiom — changing
     * this triggers a replacement.
     */
    name: string;
    /** Free-form description shown in the Axiom UI. */
    description?: string;
    /**
     * Edge deployment where Axiom stores and processes the dataset's data.
     * Defaults to the organization's default edge deployment.
     *
     * Cannot be changed after creation — triggers a replacement.
     */
    edgeDeployment?: string;
    /**
     * Dataset kind. Defaults to `axiom:events:v1`.
     *
     * For OTEL pipelines, choose:
     * - `otel:traces:v1` for traces
     * - `otel:logs:v1` for logs
     * - `otel:metrics:v1` for metrics
     *
     * Cannot be changed after creation — triggers a replacement.
     */
    kind?: DatasetKind;
    /** Retention in days. Plan-dependent — see Axiom docs. */
    retentionDays?: number;
    /** Whether to enforce the configured retention period. */
    useRetentionPeriod?: boolean;
};
export type Dataset = Resource<"Axiom.Dataset", DatasetProps, {
    id: string;
    name: string;
    kind: DatasetKind;
    description: string;
    created: string;
    /** Edge deployment where the dataset's data is stored and processed. */
    edgeDeployment: string;
    /** Base URL for ingesting and querying data in the dataset's edge deployment. */
    edgeDeploymentUrl: string;
    /** Base URL for Axiom's centralized management API. */
    apiBaseUrl: string;
    /** Root OTLP endpoint. Most exporters auto-append the signal path. */
    otelEndpoint: string;
    /** OTLP/HTTP traces endpoint. */
    otelTracesEndpoint: string;
    /** OTLP/HTTP logs endpoint. */
    otelLogsEndpoint: string;
    /** OTLP/HTTP metrics endpoint. */
    otelMetricsEndpoint: string;
    /**
     * Headers required for OTLP shipping aside from the bearer token.
     * Add `Authorization: Bearer <AXIOM_TOKEN>` separately at runtime so the
     * secret is never persisted in resource state.
     */
    otelHeaders: Record<string, string>;
}, never, Providers>;
/**
 * An Axiom dataset — the top-level container that stores events, logs,
 * traces, or metrics. Pick a `kind` up-front: it determines schema and how
 * the data is shown in the UI, and **cannot be changed** after creation
 * (changing it triggers a replacement, which deletes the data).
 *
 * Datasets expose their edge deployment and Axiom's OTLP/HTTP endpoints
 * (`otelTracesEndpoint`, `otelLogsEndpoint`, `otelMetricsEndpoint`) as output
 * attributes so you can inject them into a Worker / Lambda's env vars for
 * OpenTelemetry shipping. The bearer token is **not** stored in resource state
 * — supply `Authorization: Bearer <AXIOM_TOKEN>` separately at runtime.
 * @see https://axiom.co/docs/reference/datasets
 * @see https://axiom.co/docs/send-data/opentelemetry — OTLP endpoint reference
 *
 * ### Creating a Dataset
 * **Example:** Logs dataset with 30-day retention
 * ```typescript
 * const logs = yield* Axiom.Dataset("app-logs", {
 *   name: "my-app-logs",
 *   kind: "otel:logs:v1",
 *   description: "Application logs from prod workers",
 *   retentionDays: 30,
 *   useRetentionPeriod: true,
 * });
 * ```
 *
 * **Example:** Separate datasets per OTEL signal
 * ```typescript
 * const traces  = yield* Axiom.Dataset("traces",  { name: "app-traces",  kind: "otel:traces:v1"  });
 * const logs    = yield* Axiom.Dataset("logs",    { name: "app-logs",    kind: "otel:logs:v1"    });
 * const metrics = yield* Axiom.Dataset("metrics", { name: "app-metrics", kind: "otel:metrics:v1" });
 * ```
 *
 * ### Shipping OTEL data
 * **Example:** Wire OTEL env vars into a Cloudflare Worker
 * ```typescript
 * yield* Cloudflare.Worker("api", {
 *   vars: {
 *     OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: traces.otelTracesEndpoint,
 *     OTEL_EXPORTER_OTLP_LOGS_ENDPOINT:   logs.otelLogsEndpoint,
 *     // Bearer token must come from a secret store, not the dataset state.
 *     OTEL_EXPORTER_OTLP_HEADERS:
 *       `Authorization=Bearer ${env.AXIOM_TOKEN},X-Axiom-Dataset=${traces.name}`,
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Dataset: import("../Resource.ts").ResourceClass<Dataset>;
export declare const DatasetProvider: () => import("effect/Layer").Layer<Provider.Provider<Dataset>, never, Stack | Stage | Axiom.AxiomOpContext>;
//# sourceMappingURL=Dataset.d.ts.map