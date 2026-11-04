import * as Axiom from "@distilled.cloud/axiom";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Providers } from "./Providers.ts";
export type ViewProps = Axiom.CreateViewRequest;
export type View = Resource<"Axiom.View", ViewProps, Axiom.View & {
    /**
     * Path identifier used by `updateView` / `getView` / `deleteView`.
     * Currently derived from `name` because Axiom's view list/get responses
     * don't expose a separate id field.
     */
    id: string;
}, never, Providers>;
/**
 * An Axiom saved view — a named, shareable APL query. Useful for building
 * starter dashboards, providing canned "open in Axiom" links from your app,
 * or pinning common investigations the team revisits.
 *
 * The path identifier is `name`. Renaming a view triggers a replacement
 * (the old one is deleted, a new one is created).
 * @see https://axiom.co/docs/query-data/datasets — APL query reference
 *
 * ### Creating a View
 * **Example:** Recent errors across one dataset
 * ```typescript
 * yield* Axiom.View("recent-errors", {
 *   name: "recent-errors",
 *   description: "Last 100 5xx responses",
 *   datasets: ["my-app-traces"],
 *   aplQuery: `
 *     ['my-app-traces']
 *     | where status >= 500
 *     | order by _time desc
 *     | take 100
 *   `,
 * });
 * ```
 *
 * **Example:** Cross-dataset join (logs + traces by trace_id)
 * ```typescript
 * yield* Axiom.View("trace-with-logs", {
 *   name: "trace-with-logs",
 *   datasets: ["my-app-traces", "my-app-logs"],
 *   aplQuery: `
 *     ['my-app-traces']
 *     | where duration_ms > 1000
 *     | join kind=leftouter (['my-app-logs']) on trace_id
 *   `,
 * });
 * ```
 *
 * @resource
 */
export declare const View: import("../Resource.ts").ResourceClass<View>;
export declare const ViewProvider: () => import("effect/Layer").Layer<Provider.Provider<View>, never, Axiom.AxiomOpContext>;
//# sourceMappingURL=View.d.ts.map