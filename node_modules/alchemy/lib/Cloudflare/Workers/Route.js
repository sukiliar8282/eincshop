import * as workers from "@distilled.cloud/cloudflare/workers";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { listAllZones } from "../Zone/lookup.js";
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
export const WorkerRoute = Resource("Cloudflare.Workers.Route");
export const isWorkerRoute = (value) => Predicate.hasProperty(value, "Type") &&
    value.Type === "Cloudflare.Workers.Route";
export const WorkerRouteProvider = () => Provider.succeed(WorkerRoute, {
    stables: ["routeId", "zoneId"],
    diff: Effect.fn(function* ({ olds = {}, news }) {
        const o = olds;
        const n = news;
        // zoneId is Input<string>; by diff time both sides are concrete
        // strings when statically knowable.
        if (typeof o.zoneId === "string" &&
            typeof n.zoneId === "string" &&
            o.zoneId !== n.zoneId) {
            return { action: "replace" };
        }
    }),
    read: Effect.fn(function* ({ output, olds }) {
        // Owned path: refresh by our persisted route id.
        if (output?.routeId) {
            const observed = yield* observeById(output.zoneId, output.routeId);
            if (observed) {
                return toAttributes(observed, output.zoneId);
            }
        }
        // Adoption path: no state of our own, but Cloudflare enforces one
        // route per pattern per zone, so a `(zoneId, pattern)` match is
        // the same logical route. Routes carry no ownership markers, so
        // brand it `Unowned` and let the engine gate takeover behind the
        // adopt policy.
        const zoneId = output?.zoneId ?? olds?.zoneId;
        const pattern = output?.pattern ?? olds?.pattern;
        if (zoneId && pattern) {
            const observed = yield* findByPattern(zoneId, pattern);
            if (observed) {
                return Unowned(toAttributes(observed, zoneId));
            }
        }
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        // Inputs have been resolved to concrete strings by Plan.
        const zoneId = news.zoneId;
        const script = news.script;
        // 1. Observe by cached id first.
        let observed = output?.routeId
            ? yield* observeById(zoneId, output.routeId)
            : undefined;
        // 2. Fall back to scanning the zone for the pattern. Ownership has
        //    already been verified upstream — `read` reports existing
        //    routes as `Unowned` and the engine gates takeover behind the
        //    adopt policy before reconcile ever runs.
        if (!observed) {
            observed = yield* findByPattern(zoneId, news.pattern);
        }
        // 3. Ensure. A duplicate-pattern failure means another actor (or a
        //    crashed previous reconcile) created the route between our
        //    observation and now — treat it as a race and converge via PUT.
        if (!observed) {
            observed = yield* workers
                .createRoute({ zoneId, pattern: news.pattern, script })
                .pipe(Effect.map(normalizeRoute), Effect.catchTag("InvalidRoute", (originalError) => Effect.gen(function* () {
                const match = yield* findByPattern(zoneId, news.pattern);
                if (!match) {
                    return yield* Effect.fail(originalError);
                }
                return match;
            })));
        }
        // 4. Sync — PUT resends the full desired body when the observed
        //    route drifts from the desired pattern/script.
        if (observed.pattern !== news.pattern || observed.script !== script) {
            observed = normalizeRoute(yield* workers.updateRoute({
                zoneId,
                routeId: observed.id,
                pattern: news.pattern,
                script,
            }));
        }
        // 5. Return.
        return toAttributes(observed, zoneId);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* workers
            .deleteRoute({
            zoneId: output.zoneId,
            routeId: output.routeId,
        })
            .pipe(Effect.catchTag("RouteNotFound", () => Effect.void));
    }),
    // Routes are zone-scoped (`/zones/{id}/workers/routes`) with no account-
    // wide enumeration API. Fan out over every zone via `listAllZones`,
    // exhaustively paginate `listRoutes` per zone, and hydrate each into the
    // same Attributes shape `read` returns. Zones the scoped token can't
    // reach (Forbidden) or that reject the route (InvalidRoute) are skipped
    // with a typed catch rather than failing the whole enumeration.
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const zones = yield* listAllZones(accountId);
        const rows = yield* Effect.forEach(zones, (zone) => workers.listRoutes.pages({ zoneId: zone.id }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((route) => toAttributes(normalizeRoute(route), zone.id)))), Effect.catchTag(["InvalidRoute", "Forbidden"], () => Effect.succeed([]))), { concurrency: 10 });
        return rows.flat();
    }),
});
/**
 * Distilled types `script` as `string | null | undefined`; an opt-out
 * route comes back as `null` (or empty string from older API versions).
 * Normalize both to `undefined` so drift comparison is stable.
 */
const normalizeRoute = (raw) => ({
    id: raw.id,
    pattern: raw.pattern,
    script: raw.script == null || raw.script === "" ? undefined : raw.script,
});
const toAttributes = (observed, zoneId) => ({
    routeId: observed.id,
    zoneId,
    pattern: observed.pattern,
    script: observed.script,
});
const observeById = (zoneId, routeId) => workers.getRoute({ zoneId, routeId }).pipe(Effect.map(normalizeRoute), 
// A missing route surfaces as a 404 whose CF error code varies —
// `RouteNotFound` (10009 or a bare 404 envelope) or `WorkerNotFound`
// (10007, how some API versions tag a GET on a missing route). Both
// are in `getRoute`'s typed union; swallow them so the reconciler
// falls through to the find-by-pattern path.
Effect.catchTag(["RouteNotFound", "WorkerNotFound"], () => Effect.succeed(undefined)));
/**
 * Locate an existing route by `(zoneId, pattern)`. Cloudflare enforces
 * pattern uniqueness within a zone, so a match identifies the route.
 */
const findByPattern = (zoneId, pattern) => workers.listRoutes.items({ zoneId }).pipe(Stream.filter((r) => r.pattern === pattern), Stream.runCollect, Effect.map((chunk) => {
    const found = Array.from(chunk)[0];
    return found === undefined ? undefined : normalizeRoute(found);
}));
//# sourceMappingURL=Route.js.map