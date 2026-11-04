import * as Axiom from "@distilled.cloud/axiom";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Providers } from "./Providers.ts";
/** Dashboard input. */
export type DashboardProps = Axiom.CreateDashboardRequest;
export type Dashboard = Resource<"Axiom.Dashboard", DashboardProps, {
    /** Stable Axiom dashboard `uid` (used as the path identifier). */
    uid: string;
    id: string;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
    /** The full dashboard document as returned by Axiom. */
    dashboard: Axiom.DashboardWriteResponse["dashboard"]["dashboard"];
}, never, Providers>;
/**
 * An Axiom dashboard — a named, layout-driven collection of charts. Each
 * dashboard takes a full document (`charts` + `layout` array of grid cells +
 * `timeWindow` + `refreshTime`) at version `schemaVersion: 2`.
 *
 * Charts are typed via {@link Chart} (a discriminated union over the
 * Axiom-validated chart kinds — `TimeSeries`, `Table`, `Pie`, `Statistic`,
 * `Heatmap`, `LogStream`, `Note`). The `id` on each chart is a free-form
 * string the author picks; layout cells join via `LayoutCell.i`.
 *
 * The path identifier is `uid` (auto-assigned by Axiom). `id` is also
 * exposed as an output but the API uses `uid` everywhere.
 *
 * Notes from probing `POST /v2/dashboards`:
 *
 * - Relative time windows must use the `qr-now-{duration}` form (e.g.
 *   `"qr-now-7d"` / `"qr-now"`); plain `"now-7d"` is rejected.
 * - When authenticating with an API token, `dashboard.owner` must be `""`
 *   (Axiom rewrites this to the org-shared `X-AXIOM-EVERYONE`); per-user
 *   "private" dashboards aren't allowed for tokens.
 * - The chart payload is strict: only `id`, `name`, `type`, `query`. Extra
 *   keys (e.g. `dataset`, `description`) trigger
 *   `Unrecognized keys: "<name>"`.
 * @see https://axiom.co/docs/query-data/dashboards
 *
 * ### Creating a Dashboard
 * **Example:** Minimal empty dashboard
 * ```typescript
 * yield* Axiom.Dashboard("ops", {
 *   dashboard: {
 *     name: "Ops Overview",
 *     owner: "",                 // org-shared (required for API tokens)
 *     description: "Top-level service health",
 *     charts: [],
 *     layout: [],
 *     refreshTime: 60,           // seconds: 15 | 60 | 300
 *     schemaVersion: 2,
 *     timeWindowStart: "qr-now-1h",
 *     timeWindowEnd: "qr-now",
 *   },
 * });
 * ```
 *
 * **Example:** One-chart dashboard
 * ```typescript
 * import type { Chart, LayoutCell } from "alchemy/Axiom";
 *
 * const errors: Chart = {
 *   id: "errors-5m",
 *   name: "5xx errors / 5m",
 *   type: "TimeSeries",
 *   query: {
 *     apl: `['my-app-traces']
 *       | where status >= 500
 *       | summarize count() by bin_auto(_time)`,
 *   },
 * };
 *
 * yield* Axiom.Dashboard("errors", {
 *   dashboard: {
 *     name: "Errors",
 *     owner: "",
 *     refreshTime: 60,
 *     schemaVersion: 2,
 *     timeWindowStart: "qr-now-24h",
 *     timeWindowEnd: "qr-now",
 *     charts: [errors],
 *     layout: [{ i: errors.id, x: 0, y: 0, w: 12, h: 6 } satisfies LayoutCell],
 *   },
 * });
 * ```
 *
 * **Example:** Compare to last 24h
 * ```typescript
 * yield* Axiom.Dashboard("compare", {
 *   dashboard: {
 *     name: "Compare vs yesterday",
 *     owner: "",
 *     refreshTime: 300,
 *     schemaVersion: 2,
 *     timeWindowStart: "qr-now-1h",
 *     timeWindowEnd: "qr-now",
 *     against: "-1d",            // overlay the same window from 24h ago
 *     charts: [],
 *     layout: [],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Dashboard: import("../Resource.ts").ResourceClass<Dashboard>;
export declare const DashboardProvider: () => import("effect/Layer").Layer<Provider.Provider<Dashboard>, never, Axiom.AxiomOpContext>;
//# sourceMappingURL=Dashboard.d.ts.map