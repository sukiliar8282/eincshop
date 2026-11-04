import type { PlanStatusSession } from "../Report.ts";
import { type ProgressReporter } from "../Report.ts";
export { Progress, type ActionPlanned, type ApplyEvent, type NukeEvent, type NukeScanStarted, type NukeProviderScanStarted, type NukePassStarted, type NukeProviderScanned, type NukeResourceDeleted, type NukeResourceFailed, type PlanEvent, type PlanNodeEvent, type PlanPhaseChanged, type PlanningPhase, type ProgressEvent, type ProgressReporter, type ProviderConfigureCompleted, type ProviderConfigureStarted, type ProviderEvent, type ProviderRefreshCompleted, type ProviderRefreshStarted, type ResourceAnnotated, type ResourceDiffStarted, type ResourcePlanned, type ResourceStatusChanged, type StateBootstrapCompleted, type StateBootstrapStarted, type StateEvent, } from "../Report.ts";
/**
 * Decorate a reporter so a {@link ProgressEvent} with a span-event shape is
 * also recorded on the currently active span before it reaches the
 * renderer. Emission happens inside the engine's instrumented fibers, so
 * apply events land on `apply.resource` / `provider.<op>` spans — giving
 * traces a within-span timeline of status transitions. A no-op when no
 * span is active (tracing disabled), and independent of whether a renderer
 * is attached, so `--yes` and CI runs still produce the events.
 */
export declare const withSpanEvents: (report: ProgressReporter) => ProgressReporter;
/** Adapt the ambient reporter to the engine's apply-session contract. */
export declare const applySession: (report: ProgressReporter) => PlanStatusSession;
//# sourceMappingURL=Progress.d.ts.map