import * as workers from "@distilled.cloud/cloudflare/workers";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
export interface WorkerRouteProps {
    /**
     * Zone the route lives in. Stable — routes are scoped to a zone, so
     * changing the zone triggers a replacement.
     */
    zoneId: string;
    /**
     * Pattern to match incoming requests against, e.g.
     * `api.example.com/*`. The pattern must match a hostname inside the
     * zone identified by {@link zoneId}.
     *
     * Mutable — Cloudflare's PUT endpoint accepts a new pattern in place.
     * Declared as plain `string` (not `string`) so the reconciler
     * can locate an existing route by pattern after state loss.
     */
    pattern: string;
    /**
     * Name of the Worker script to run when the route matches. Accepts a
     * reference to a deployed Worker's `workerName`. When omitted, the
     * route disables Workers for matching requests (useful to opt a path
     * out of a broader wildcard route).
     *
     * Mutable — updated in place.
     */
    script?: string;
}
export interface WorkerRouteAttributes {
    /** Cloudflare-assigned route identifier. */
    routeId: string;
    /** Zone that owns this route. */
    zoneId: string;
    /** Pattern the route matches. */
    pattern: string;
    /** Worker script the route runs, or `undefined` for an opt-out route. */
    script: string | undefined;
}
export type WorkerRoute = Resource<"Cloudflare.Workers.Route", WorkerRouteProps, WorkerRouteAttributes, never, Providers>;
/**
 * A Workers Route — a zone-level mapping from a URL pattern to a Worker
 * script.
 *
 * Routes are the classic way to serve a Worker on a zone hostname or
 * path. The matched hostname must resolve through Cloudflare's proxy,
 * so pair the route with a proxied DNS record (an `AAAA 100::`
 * placeholder is the conventional choice when the Worker is the only
 * origin).
 *
 * Safety: routes carry no ownership markers, and Cloudflare enforces
 * one route per pattern per zone. When there is no prior state, `read`
 * scans the zone for an existing route with the same pattern and
 * reports it as `Unowned`, so the engine refuses to take it over unless
 * `--adopt` (or `adopt(true)`) is set.
 * ### Routing a hostname to a Worker
 * **Example:** Route all requests on a subdomain to a Worker
 * ```typescript
 * const worker = yield* Cloudflare.Worker("Api", {
 *   main: "./src/api.ts",
 * });
 *
 * yield* Cloudflare.Workers.WorkerRoute("ApiRoute", {
 *   zoneId: zone.zoneId,
 *   pattern: "api.example.com/*",
 *   script: worker.workerName,
 * });
 *
 * // Workers only run on proxied hostnames — give the host an origin.
 * yield* Cloudflare.DNS.Record("ApiPlaceholder", {
 *   zoneId: zone.zoneId,
 *   name: "api.example.com",
 *   type: "AAAA",
 *   content: "100::",
 *   proxied: true,
 * });
 * ```
 *
 * ### Disabling Workers on a path
 * **Example:** Opt a path out of a wildcard route
 * ```typescript
 * // No `script` — matching requests bypass Workers entirely.
 * yield* Cloudflare.Workers.WorkerRoute("AssetsBypass", {
 *   zoneId: zone.zoneId,
 *   pattern: "example.com/assets/*",
 * });
 * ```
 *
 * @resource
 * @product Workers
 * @category Workers & Compute
 */
export declare const WorkerRoute: import("../../Resource.ts").ResourceClass<WorkerRoute>;
export declare const isWorkerRoute: (value: unknown) => value is WorkerRoute;
export declare const WorkerRouteProvider: () => import("effect/Layer").Layer<Provider.Provider<WorkerRoute>, never, CloudflareEnvironment | workers.CloudflareOpContext>;
//# sourceMappingURL=Route.d.ts.map