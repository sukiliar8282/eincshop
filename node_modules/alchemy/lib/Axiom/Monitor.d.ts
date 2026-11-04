import * as Axiom from "@distilled.cloud/axiom";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Providers } from "./Providers.ts";
export type MonitorProps = Axiom.CreateMonitorRequest;
export type Monitor = Resource<"Axiom.Monitor", MonitorProps, Axiom.CreateMonitorResponse, never, Providers>;
/**
 * An Axiom monitor — a scheduled APL/MPL query that evaluates on a fixed
 * cadence and fires alerts via {@link Notifier notifiers} when its
 * condition is met.
 *
 * Three monitor `type`s are supported:
 *
 * - **`Threshold`** — fires when an aggregate result crosses a static
 *   `threshold` (compared with `operator`).
 * - **`MatchEvent`** — fires for every event matching the query.
 * - **`AnomalyDetection`** — fires when results deviate from a learned
 *   baseline by more than `tolerance` over `compareDays`.
 *
 * Changing `type` triggers a replacement; everything else updates in place.
 * @see https://axiom.co/docs/monitor-data/monitors
 *
 * ### Creating a Monitor
 * **Example:** Threshold: alert on >100 errors per 5m
 * ```typescript
 * yield* Axiom.Monitor("error-rate", {
 *   name: "High error rate",
 *   description: "Fires when error count exceeds 100/5m",
 *   type: "Threshold",
 *   aplQuery: `
 *     ['my-app-traces']
 *     | where status >= 500
 *     | summarize count() by bin_auto(_time)
 *   `,
 *   operator: "Above",
 *   threshold: 100,
 *   intervalMinutes: 5,
 *   rangeMinutes: 5,
 *   alertOnNoData: false,
 *   resolvable: true,
 *   notifierIds: [slack.id, pagerduty.id],
 * });
 * ```
 *
 * **Example:** MatchEvent: alert on every panic
 * ```typescript
 * yield* Axiom.Monitor("panics", {
 *   name: "Service panic",
 *   type: "MatchEvent",
 *   aplQuery: `['my-app-logs'] | where message contains "panic:"`,
 *   intervalMinutes: 1,
 *   rangeMinutes: 1,
 *   notifierIds: [pagerduty.id],
 * });
 * ```
 *
 * **Example:** AnomalyDetection: deviation vs. last 7 days
 * ```typescript
 * yield* Axiom.Monitor("traffic-anomaly", {
 *   name: "Traffic anomaly",
 *   type: "AnomalyDetection",
 *   aplQuery: `['my-app-traces'] | summarize count() by bin_auto(_time)`,
 *   compareDays: 7,
 *   tolerance: 25,             // %
 *   intervalMinutes: 15,
 *   rangeMinutes: 15,
 *   notifierIds: [slack.id],
 * });
 * ```
 *
 * @resource
 */
export declare const Monitor: import("../Resource.ts").ResourceClass<Monitor>;
export declare const MonitorProvider: () => import("effect/Layer").Layer<Provider.Provider<Monitor>, never, Axiom.AxiomOpContext>;
//# sourceMappingURL=Monitor.d.ts.map