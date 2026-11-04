import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type { ResourceBinding } from "../../Resource.ts";
import { Worker, type WorkerProps } from "./Worker.ts";
/**
 * Earliest compatibility date that exposes `tracing.startActiveSpan`
 * (`cloudflare:workers`). ISO dates compare lexically.
 */
export declare const MIN_CLOUDFLARE_TRACING_DATE = "2026-07-28";
declare const CloudflareTelemetryCompatibilityError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "CloudflareTelemetryCompatibilityError";
} & Readonly<A>;
/**
 * Thrown when {@link Telemetry} is provided on a Worker whose resolved
 * compatibility date is older than {@link MIN_CLOUDFLARE_TRACING_DATE}.
 */
export declare class CloudflareTelemetryCompatibilityError extends CloudflareTelemetryCompatibilityError_base<{
    date: string;
    minimumDate: string;
}> {
    get message(): string;
}
export interface CloudflareTelemetryProps {
    /**
     * Enable Workers Traces on the host Worker.
     * @default true
     */
    enabled?: boolean;
    /**
     * Head-based sampling rate for Workers Traces (`0`–`1`).
     * Omitted unless set — Cloudflare's default applies.
     */
    headSamplingRate?: number;
    /**
     * Persist traces in the Cloudflare dashboard. Omitted unless set.
     * Pass `false` to export-only (no dashboard persist).
     */
    persist?: boolean;
}
/**
 * Fail deploy when `Cloudflare.Telemetry()` is bound and the Worker's
 * resolved compatibility date is too old for `tracing.startActiveSpan`.
 *
 * @internal
 */
export declare const assertCloudflareTelemetryCompatibility: (news: WorkerProps, bindings: ReadonlyArray<ResourceBinding<Worker["Binding"]>>) => Effect.Effect<void, CloudflareTelemetryCompatibilityError>;
/**
 * Mirror Effect spans into Cloudflare Workers Observability.
 *
 * A binding layer: at deploy time it turns on `observability.traces` on the
 * host Worker (the same path as `Cloudflare.cache()`) and registers a
 * per-event Effect Tracer. Cloudflare auto-instruments fetch/KV/R2/D1;
 * `Effect.withSpan` / `Effect.fn` frames nest in that waterfall. Cloudflare
 * owns sampling and export — no OTLP URL, flush, or Wrangler block.
 *
 * Until the global default compatibility date is raised past 2026-07-28,
 * pin `compatibility: { date: "2026-08-25" }` (or later) or deploy fails.
 * `alchemy dev` does not gate the date: what a local Worker records is the
 * local runtime's concern.
 *
 * Compose it into the Function/Worker's single `Effect.provide`:
 *
 * ### Enabling native tracing
 * **Example:** Effect spans in the Workers Observability waterfall
 * ```typescript
 * export default Cloudflare.Worker(
 *   "Worker",
 *   {
 *     main: import.meta.url,
 *     compatibility: { date: "2026-08-25" },
 *   },
 *   Effect.gen(function* () {
 *     return {
 *       fetch: Effect.gen(function* () {
 *         yield* doWork().pipe(Effect.withSpan("operation"));
 *         return HttpServerResponse.text("ok");
 *       }),
 *     };
 *   }).pipe(
 *     Effect.provide(
 *       Layer.mergeAll(
 *         Cloudflare.R2.ReadWriteBucketBinding,
 *         Cloudflare.Telemetry(),
 *       ),
 *     ),
 *   ),
 * );
 * ```
 *
 * ### Combining with other exporters
 * **Example:** Native traces plus another exporter's logs and metrics
 * ```typescript
 * Effect.provide(
 *   Layer.mergeAll(
 *     Cloudflare.Telemetry(),
 *     // omit `traces` — Cloudflare.Telemetry provides the Tracer
 *     Axiom.Telemetry({ token: Ingest, logs: Logs, metrics: Metrics }),
 *   ),
 * )
 * ```
 *
 * To ship the same waterfall (Effect + platform spans) elsewhere, export
 * it from Cloudflare with `Cloudflare.Workers.ObservabilityDestination`
 * rather than sending a second Worker-side OTLP trace stream.
 *
 * @layer
 * @provides Tracer.Tracer
 * @product Workers
 * @category Workers & Compute
 */
export declare const Telemetry: (props?: CloudflareTelemetryProps) => Layer.Layer<never, never, Worker>;
export {};
//# sourceMappingURL=Telemetry.d.ts.map