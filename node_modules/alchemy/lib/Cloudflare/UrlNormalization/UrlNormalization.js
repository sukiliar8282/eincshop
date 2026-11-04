import * as urlNormalization from "@distilled.cloud/cloudflare/url-normalization";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Schedule from "effect/Schedule";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { listAllZones } from "../Zone/lookup.js";
const TypeId = "Cloudflare.UrlNormalization.UrlNormalization";
/**
 * The URL normalization configuration of a Cloudflare zone
 * (`/zones/{zone_id}/url_normalization`) — a zone-scoped **singleton**
 * controlling how Cloudflare normalizes incoming URLs before rule matching
 * and before forwarding to the origin.
 *
 * The setting always exists on every zone (with Cloudflare defaults
 * `scope: "incoming"`, `type: "cloudflare"`), so reconcile adopts the
 * singleton and PUTs the desired `{ scope, type }` only when the observed
 * configuration differs. Destroy issues the API's true reset operation
 * (DELETE), returning the zone to Cloudflare defaults.
 * ### Managing URL normalization
 * **Example:** Normalize URLs sent to the origin too
 * ```typescript
 * yield* Cloudflare.UrlNormalization.UrlNormalization("UrlNormalization", {
 *   zoneId: zone.zoneId,
 *   scope: "both",
 * });
 * ```
 *
 * **Example:** Strict RFC 3986 normalization
 * ```typescript
 * yield* Cloudflare.UrlNormalization.UrlNormalization("UrlNormalization", {
 *   zoneId: zone.zoneId,
 *   scope: "incoming",
 *   type: "rfc3986",
 * });
 * ```
 *
 * **Example:** Disable URL normalization
 * ```typescript
 * yield* Cloudflare.UrlNormalization.UrlNormalization("UrlNormalization", {
 *   zoneId: zone.zoneId,
 *   scope: "none",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/rules/normalization/
 *
 * @resource
 * @product URL Normalization
 * @category Rules & Configuration
 */
export const UrlNormalization = Resource(TypeId, {
    aliases: ["Cloudflare.UrlNormalization"],
});
/**
 * Returns true if the given value is a UrlNormalization resource.
 */
export const isUrlNormalization = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
/** Cloudflare's zone default scope. */
const DEFAULT_SCOPE = "incoming";
/** Cloudflare's zone default normalization type. */
const DEFAULT_TYPE = "cloudflare";
export const UrlNormalizationProvider = () => Provider.succeed(UrlNormalization, {
    nuke: { singleton: true },
    stables: ["zoneId"],
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // No account-wide API for this zone singleton — enumerate every
        // zone in the account and read its URL normalization (every zone
        // has one).
        const allZones = yield* listAllZones(accountId);
        const rows = yield* Effect.forEach(allZones.map((zone) => zone.id), (zoneId) => urlNormalization.getUrlNormalization({ zoneId }).pipe(
        // Cloudflare intermittently rejects a *valid* token with
        // `Forbidden` (a transient edge auth failure). Retry with capped
        // backoff rather than dropping the zone, so a genuinely accessible
        // zone never falls out of the enumeration on a blip.
        Effect.retry({
            while: (e) => e._tag === "Forbidden",
            schedule: Schedule.max([
                Schedule.min([
                    Schedule.exponential("500 millis"),
                    Schedule.spaced("5 seconds"),
                ]),
                Schedule.recurs(8),
            ]),
        }), Effect.map((observed) => toAttributes(zoneId, observed)), 
        // Plan-gated or partial zones reject the route; skip them.
        Effect.catchTag("InvalidRoute", () => Effect.succeed(undefined))), { concurrency: 10 });
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
        // The setting is a singleton that always exists with Cloudflare
        // defaults — there is nothing to "own", so a cold read adopts freely
        // (never `Unowned`). A dead zone reads as gone.
        const observed = yield* urlNormalization
            .getUrlNormalization({ zoneId })
            .pipe(Effect.catchTag("InvalidRoute", () => Effect.succeed(undefined)));
        if (observed === undefined)
            return undefined;
        return toAttributes(zoneId, observed);
    }),
    reconcile: Effect.fn(function* ({ news }) {
        // Inputs have been resolved to concrete strings by Plan.
        const zoneId = news.zoneId;
        const desiredScope = news.scope ?? DEFAULT_SCOPE;
        const desiredType = news.type ?? DEFAULT_TYPE;
        // 1. Observe — the singleton always exists on a live zone.
        const observed = yield* urlNormalization.getUrlNormalization({ zoneId });
        // 2. Sync — PUT is a full replace of { scope, type }; skip the API
        //    entirely when the observed configuration already matches.
        if (observed.scope === desiredScope && observed.type === desiredType) {
            return toAttributes(zoneId, observed);
        }
        const updated = yield* urlNormalization.putUrlNormalization({
            zoneId,
            scope: desiredScope,
            type: desiredType,
        });
        return toAttributes(zoneId, updated);
    }),
    delete: Effect.fn(function* ({ output }) {
        // True reset operation — returns the zone to Cloudflare defaults.
        // Idempotent: resetting an already-default zone succeeds, and a dead
        // zone is treated as already reset.
        yield* urlNormalization
            .deleteUrlNormalization({ zoneId: output.zoneId })
            .pipe(Effect.catchTag("InvalidRoute", () => Effect.void));
    }),
});
const toAttributes = (zoneId, observed) => ({
    zoneId,
    scope: observed.scope,
    type: observed.type,
});
//# sourceMappingURL=UrlNormalization.js.map