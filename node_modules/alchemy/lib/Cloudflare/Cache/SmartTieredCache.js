import * as cache from "@distilled.cloud/cloudflare/cache";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { listAllZones } from "../Zone/lookup.js";
const TypeId = "Cloudflare.Cache.SmartTieredCache";
/**
 * The Smart Tiered Cache setting of a Cloudflare zone
 * (`/zones/{zone_id}/cache/tiered_cache_smart_topology_enable`).
 *
 * Smart Tiered Cache dynamically selects the single best upper-tier data
 * center for each origin, reducing requests that reach the origin. The
 * setting is a zone **singleton** — it always exists on every zone (default
 * `off`), so this resource never creates or deletes anything physical.
 * Reconcile patches the setting when the observed value differs from the
 * desired one; destroy restores the value the setting had before Alchemy
 * first managed it (captured as `initialValue`).
 *
 * Only one `SmartTieredCache` resource per zone makes sense — two instances
 * managing the same zone would fight over the singleton.
 * ### Managing Smart Tiered Cache
 * **Example:** Enable Smart Tiered Cache on a zone
 * ```typescript
 * const zone = yield* Cloudflare.Zone.Zone("Site", { name: "example.com" });
 *
 * yield* Cloudflare.Cache.SmartTieredCache("SmartCache", {
 *   zoneId: zone.zoneId,
 * });
 * ```
 *
 * **Example:** Explicitly disable Smart Tiered Cache
 * ```typescript
 * yield* Cloudflare.Cache.SmartTieredCache("SmartCache", {
 *   zoneId: zone.zoneId,
 *   enabled: false,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cache/how-to/tiered-cache/
 *
 * @resource
 * @product Cache
 * @category Performance & Reliability
 */
export const SmartTieredCache = Resource(TypeId);
/**
 * Returns true if the given value is a SmartTieredCache resource.
 */
export const isSmartTieredCache = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
const desiredValue = (props) => (props.enabled ?? true) ? "on" : "off";
export const SmartTieredCacheProvider = () => Provider.succeed(SmartTieredCache, {
    nuke: { singleton: true },
    stables: ["zoneId", "initialValue"],
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // No account-wide API for this zone singleton — enumerate every
        // zone in the account and read its setting (every zone has one).
        const allZones = yield* listAllZones(accountId);
        const rows = yield* Effect.forEach(allZones.map((zone) => zone.id), (zoneId) => cache.getSmartTieredCache({ zoneId }).pipe(Effect.map((observed) => toAttributes(zoneId, observed, observed.value)), 
        // Smart Tiered Cache is an Enterprise feature. When enumerating
        // every zone in the account, zones that aren't entitled reject the
        // read — as `InvalidRoute`, or as a persistent `Forbidden`/
        // `Unauthorized` ("Access denied") on the gated route. These are
        // not the transient code-10000 auth blips the global policy
        // retries; the zone simply has no readable setting, so skip it.
        Effect.catchTag(["InvalidRoute", "Forbidden", "Unauthorized"], () => Effect.succeed(undefined))), { concurrency: 10 });
        return rows.filter((row) => row !== undefined);
    }),
    diff: Effect.fn(function* ({ olds = {}, news, output }) {
        const o = olds;
        const n = news;
        // zoneId is Input<string>; compare only once both sides are concrete.
        const oldZoneId = output?.zoneId ?? (typeof o.zoneId === "string" ? o.zoneId : undefined);
        if (oldZoneId !== undefined &&
            typeof n.zoneId === "string" &&
            oldZoneId !== n.zoneId) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ output, olds }) {
        const zoneId = output?.zoneId ?? olds?.zoneId;
        if (!zoneId)
            return undefined;
        const observed = yield* cache.getSmartTieredCache({ zoneId }).pipe(
        // Zone deleted out-of-band — the setting is gone with it.
        Effect.catchTag("InvalidRoute", () => Effect.succeed(undefined)));
        if (observed === undefined)
            return undefined;
        // The setting is a singleton that always exists with a Cloudflare
        // default — there is nothing to "own", so a cold read adopts
        // freely (never `Unowned`). The observed value at adoption time
        // becomes the `initialValue` restored on destroy.
        const initialValue = output !== undefined ? output.initialValue : observed.value;
        return toAttributes(zoneId, observed, initialValue);
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        // Inputs have been resolved to concrete strings by Plan.
        const zoneId = news.zoneId;
        // 1. Observe — the setting always exists; read its live value.
        const observed = yield* cache.getSmartTieredCache({ zoneId });
        // 2. Capture — the pre-management value, restored on destroy.
        //    `output` (including an adoption read) already carries it;
        //    otherwise this is our first touch and the observed value is
        //    the zone's original.
        const initialValue = output !== undefined ? output.initialValue : observed.value;
        // 3. Sync — patch only when the observed value differs.
        const desired = desiredValue(news);
        if (observed.value === desired) {
            return toAttributes(zoneId, observed, initialValue);
        }
        const patched = yield* cache.patchSmartTieredCache({
            zoneId,
            value: desired,
        });
        return toAttributes(zoneId, patched, initialValue);
    }),
    delete: Effect.fn(function* ({ output }) {
        const { zoneId, initialValue } = output;
        // Observe — if the zone itself is gone, so is the setting.
        const observed = yield* cache
            .getSmartTieredCache({ zoneId })
            .pipe(Effect.catchTag("InvalidRoute", () => Effect.succeed(undefined)));
        if (observed === undefined)
            return;
        // Restore the pre-management value; skip the call when it already
        // matches (idempotent re-delete after a crashed run).
        if (observed.value === initialValue)
            return;
        yield* cache
            .patchSmartTieredCache({ zoneId, value: initialValue })
            .pipe(Effect.catchTag("InvalidRoute", () => Effect.void));
    }),
});
const toAttributes = (zoneId, setting, initialValue) => ({
    zoneId,
    value: setting.value,
    editable: setting.editable,
    modifiedOn: setting.modifiedOn ?? undefined,
    initialValue,
});
//# sourceMappingURL=SmartTieredCache.js.map