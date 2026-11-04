import * as workers from "@distilled.cloud/cloudflare/workers";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Workers.ObservabilityDestination";
type TypeId = typeof TypeId;
/**
 * The Workers Logs dataset exported by an observability destination.
 */
export type ObservabilityDataset = "opentelemetry-traces" | "opentelemetry-logs" | "opentelemetry-metrics";
export interface ObservabilityDestinationProps {
    /**
     * Human readable destination name. Cloudflare derives the destination's
     * stable `slug` from it and the name cannot be changed afterwards —
     * updating this property triggers a replacement. If omitted, a unique
     * name is generated from the app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * HTTPS endpoint the OTLP payloads are pushed to (e.g. an OTLP/HTTP
     * collector). Mutable — updated in place.
     *
     * Cloudflare verifies the endpoint with a preflight request on create
     * (unless {@link skipPreflightCheck} is set) and on **every** update, so
     * the endpoint must accept a `POST` with a `2xx` response for updates to
     * succeed.
     */
    url: string;
    /**
     * Extra HTTP headers sent with each push (e.g. authentication tokens).
     * Cloudflare always adds a `content-type: application/json` header of
     * its own. Mutable — updated in place.
     * @default {}
     */
    headers?: Record<string, string>;
    /**
     * Which Workers Logs dataset to export. Cannot be changed after
     * creation — updating this property triggers a replacement.
     */
    logpushDataset: ObservabilityDataset;
    /**
     * Whether the destination actively exports data. Mutable — updated in
     * place.
     * @default true
     */
    enabled?: boolean;
    /**
     * Skip the create-time preflight request against {@link url}. Useful
     * when the collector rejects empty probe payloads. Create-only — the
     * update API always performs the preflight check.
     * @default false
     */
    skipPreflightCheck?: boolean;
}
export interface ObservabilityDestinationAttributes {
    /**
     * Cloudflare-assigned stable identifier, derived from the name at
     * creation time.
     */
    slug: string;
    /**
     * The Cloudflare account the destination belongs to.
     */
    accountId: string;
    /**
     * Human readable destination name.
     */
    name: string;
    /**
     * Whether the destination actively exports data.
     */
    enabled: boolean;
    /**
     * HTTPS endpoint the OTLP payloads are pushed to.
     */
    url: string;
    /**
     * The Workers Logs dataset this destination exports.
     */
    logpushDataset: ObservabilityDataset;
    /**
     * The underlying Logpush destination string (the URL with the
     * configured headers encoded as query parameters).
     */
    destinationConf: string;
    /**
     * Names of the Worker scripts currently opted in to this destination.
     */
    scripts: string[];
}
export type ObservabilityDestination = Resource<TypeId, ObservabilityDestinationProps, ObservabilityDestinationAttributes, never, Providers>;
/**
 * A Workers observability destination — an account-level OTLP export of
 * Workers Logs telemetry (traces, logs, or metrics) pushed to an external
 * HTTPS collector via Logpush.
 *
 * A destination is identified by its Cloudflare-derived `slug` (stable,
 * computed from the name at creation). The endpoint URL, headers, and
 * enabled flag are mutable in place; `name` and `logpushDataset` force a
 * replacement.
 *
 * Cloudflare preflights the endpoint with a `POST` on create (skippable
 * via `skipPreflightCheck`) and on every in-place update (not skippable),
 * so the collector must answer `2xx` for updates to converge.
 *
 * Safety: destinations carry no ownership markers and Cloudflare enforces
 * one destination per name. When there is no prior state, `read` scans the
 * account for a destination with the same name and reports it as
 * `Unowned`, so the engine refuses to take it over unless `--adopt` (or
 * `adopt(true)`) is set.
 * ### Exporting Workers traces
 * **Example:** Push traces to an OTLP collector
 * ```typescript
 * const traces = yield* Cloudflare.Workers.ObservabilityDestination("Traces", {
 *   url: "https://otel.example.com/v1/traces",
 *   headers: { authorization: secret },
 *   logpushDataset: "opentelemetry-traces",
 * });
 * ```
 *
 * ### Exporting Workers logs
 * **Example:** Push logs, skipping the create-time preflight
 * ```typescript
 * const logs = yield* Cloudflare.Workers.ObservabilityDestination("Logs", {
 *   name: "my-app-logs",
 *   url: "https://collector.example.com/v1/logs",
 *   logpushDataset: "opentelemetry-logs",
 *   skipPreflightCheck: true,
 * });
 * ```
 *
 * ### Pausing an export
 * **Example:** Disable the destination without deleting it
 * ```typescript
 * yield* Cloudflare.Workers.ObservabilityDestination("Logs", {
 *   name: "my-app-logs",
 *   url: "https://collector.example.com/v1/logs",
 *   logpushDataset: "opentelemetry-logs",
 *   enabled: false,
 * });
 * ```
 *
 * @resource
 * @product Workers
 * @category Workers & Compute
 */
export declare const ObservabilityDestination: import("../../Resource.ts").ResourceClass<ObservabilityDestination>;
/**
 * Returns true if the given value is an ObservabilityDestination resource.
 */
export declare const isObservabilityDestination: (value: unknown) => value is ObservabilityDestination;
export declare const ObservabilityDestinationProvider: () => import("effect/Layer").Layer<Provider.Provider<ObservabilityDestination>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | workers.CloudflareOpContext>;
export {};
//# sourceMappingURL=ObservabilityDestination.d.ts.map