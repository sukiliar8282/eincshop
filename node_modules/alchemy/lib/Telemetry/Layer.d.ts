import * as Layer from "effect/Layer";
/**
 * The CLI's telemetry layer. Builds an OTLP HTTP exporter that ships spans
 * to {@link TRACES_URL} and metrics to {@link METRICS_URL}, attaching
 * {@link collectAttributes} as resource-level attributes so every signal
 * carries user/project/runtime context.
 *
 * The OTLP logger merges with the loggers already installed, so provide this
 * layer on top of the entrypoint's terminal/file logger layer — e.g.
 * `Layer.provideMerge(TelemetryLive, ConsoleLogLive)` — never as a sibling in
 * a `Layer.mergeAll` (the last `CurrentLoggers` in a merge wins, silently
 * dropping either the terminal output or the telemetry).
 *
 * If the user has opted out (via `DO_NOT_TRACK`, `NO_TRACK`,
 * `ALCHEMY_TELEMETRY_DISABLED`, or `~/.alchemy/telemetry-disabled`), this
 * resolves to {@link Layer.empty}. Effect's default `Tracer` is a no-op,
 * so all `withSpan`/`Effect.fn` instrumentation in core stays free.
 */
export declare const TelemetryLive: Layer.Layer<never, never, never>;
//# sourceMappingURL=Layer.d.ts.map