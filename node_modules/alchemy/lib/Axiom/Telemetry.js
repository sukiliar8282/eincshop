import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Output from "../Output.js";
import { layerOtlp } from "../Telemetry.js";
/**
 * Resource declarations are Effects — yield them to get the instance with
 * attribute Output accessors, same as `Binding.Service`'s callable does for
 * capability bindings.
 */
const instance = (resource) => Effect.isEffect(resource)
    ? resource
    : Effect.succeed(resource);
const signal = (token, dataset, urlAttr) => dataset === undefined
    ? undefined
    : {
        url: dataset[urlAttr],
        headers: {
            Authorization: Output.map(token.token, (bearer) => Redacted.make(`Bearer ${Redacted.value(bearer)}`)),
            "X-Axiom-Dataset": dataset.name,
        },
    };
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
export const Telemetry = (props) => Layer.unwrap(Effect.gen(function* () {
    // Declarations are yielded to instances (registering them on the
    // Stack if the enclosing host is the first to reference them), so
    // attribute accessors below produce real Outputs.
    const token = yield* instance(props.token);
    const traces = props.traces && (yield* instance(props.traces));
    const logs = props.logs && (yield* instance(props.logs));
    const metrics = props.metrics && (yield* instance(props.metrics));
    return layerOtlp({
        serviceName: props.serviceName,
        traces: signal(token, traces, "otelTracesEndpoint"),
        logs: signal(token, logs, "otelLogsEndpoint"),
        metrics: signal(token, metrics, "otelMetricsEndpoint"),
    });
}));
//# sourceMappingURL=Telemetry.js.map