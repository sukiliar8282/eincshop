import * as customHostnames from "@distilled.cloud/cloudflare/custom-hostnames";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import { Unowned } from "../../AdoptPolicy.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { listAllZones } from "../Zone/lookup.js";
/**
 * The Cloudflare for SaaS fallback origin of a zone.
 *
 * A zone-level singleton: requests to any of the zone's custom hostnames
 * that don't have a `customOriginServer` are routed to this origin.
 * Setting a fallback origin implicitly enables Cloudflare for SaaS on
 * the zone.
 *
 * Safety: when there is no prior state, `read` reports an existing
 * fallback origin as `Unowned`, so the engine refuses to overwrite an
 * out-of-band configuration unless `--adopt` (or `adopt(true)`) is set.
 * ### Setting the Fallback Origin
 * **Example:** Point custom hostname traffic at your origin
 * ```typescript
 * const record = yield* Cloudflare.DNS.Record("Origin", {
 *   zoneId: zone.zoneId,
 *   name: "origin.my-saas.com",
 *   type: "A",
 *   content: "203.0.113.1",
 *   proxied: true,
 * });
 * const fallback = yield* Cloudflare.CustomHostname.FallbackOrigin("Fallback", {
 *   zoneId: zone.zoneId,
 *   origin: record.name,
 * });
 * ```
 *
 * @resource
 * @product Custom Hostnames
 * @category Domains & DNS
 */
export const FallbackOrigin = Resource("Cloudflare.CustomHostname.FallbackOrigin", { aliases: ["Cloudflare.FallbackOrigin"] });
export const isFallbackOrigin = (value) => Predicate.hasProperty(value, "Type") &&
    value.Type === "Cloudflare.CustomHostname.FallbackOrigin";
export const FallbackOriginProvider = () => Provider.succeed(FallbackOrigin, {
    stables: ["zoneId"],
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Zone singleton — no account-wide list. Enumerate every zone and
        // read its fallback origin; zones without one configured (or
        // without Cloudflare for SaaS access) are skipped.
        const allZones = yield* listAllZones(accountId);
        const rows = yield* Effect.forEach(allZones.map((zone) => zone.id), (zoneId) => observeFallbackOrigin(zoneId).pipe(Effect.map((observed) => {
            if (observed?.origin === undefined ||
                observed.status === "pending_deletion" ||
                observed.status === "deletion_timed_out") {
                return undefined;
            }
            return {
                zoneId,
                origin: observed.origin,
                status: observed.status,
            };
        }), 
        // Zones without Cloudflare for SaaS entitlement reject the
        // route; skip them rather than failing the whole enumeration.
        Effect.catchTag(["SaasAccessNotGranted", "Forbidden"], () => Effect.succeed(undefined))), { concurrency: 10 });
        return rows.filter((row) => row !== undefined);
    }),
    diff: Effect.fn(function* ({ olds = {}, news }) {
        const o = olds;
        const n = news;
        // zoneId is Input<string>; compare only once both sides are
        // concrete strings.
        if (typeof o.zoneId === "string" &&
            typeof n.zoneId === "string" &&
            o.zoneId !== n.zoneId) {
            return { action: "replace" };
        }
    }),
    reconcile: Effect.fn(function* ({ news }) {
        // Inputs have been resolved to concrete strings by Plan.
        const zoneId = news.zoneId;
        const origin = news.origin;
        // 1. Observe the singleton.
        const observed = yield* observeFallbackOrigin(zoneId);
        // 2/3. Ensure + sync — PUT is a true upsert; skip the API call
        //      entirely when the observed origin already matches (the
        //      status field converges asynchronously on its own).
        if (observed?.origin === origin &&
            observed.status !== "pending_deletion" &&
            observed.status !== "deletion_timed_out") {
            return { zoneId, origin: observed.origin, status: observed.status };
        }
        const updated = yield* customHostnames.putFallbackOrigin({
            zoneId,
            origin,
        });
        // 4. Return fresh attributes.
        return {
            zoneId,
            origin: updated.origin ?? origin,
            status: updated.status ?? undefined,
        };
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* customHostnames
            .deleteFallbackOrigin({ zoneId: output.zoneId })
            .pipe(Effect.catchTag("FallbackOriginNotFound", () => Effect.void));
    }),
    read: Effect.fn(function* ({ output, olds }) {
        const zoneId = output?.zoneId ??
            (typeof olds?.zoneId === "string" ? olds.zoneId : undefined);
        if (!zoneId)
            return undefined;
        const observed = yield* observeFallbackOrigin(zoneId);
        if (observed?.origin === undefined ||
            observed.status === "pending_deletion" ||
            observed.status === "deletion_timed_out") {
            return undefined;
        }
        const attrs = {
            zoneId,
            origin: observed.origin,
            status: observed.status,
        };
        // Owned path: we have persisted state — refresh it. Cold path: a
        // fallback origin exists but we cannot prove we created it (the
        // API has no ownership markers), so gate takeover behind adoption.
        return output?.zoneId ? attrs : Unowned(attrs);
    }),
});
// An unset fallback origin is reported by the API as a bare 404 —
// typed in the distilled union as `FallbackOriginNotFound`.
const observeFallbackOrigin = (zoneId) => customHostnames.getFallbackOrigin({ zoneId }).pipe(Effect.map((r) => ({
    origin: r.origin ?? undefined,
    status: r.status ?? undefined,
})), Effect.catchTag("FallbackOriginNotFound", () => Effect.succeed(undefined)));
//# sourceMappingURL=FallbackOrigin.js.map