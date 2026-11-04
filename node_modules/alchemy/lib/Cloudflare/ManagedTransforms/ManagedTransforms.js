import * as managedTransforms from "@distilled.cloud/cloudflare/managed-transforms";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { listAllZones } from "../Zone/lookup.js";
const TypeId = "Cloudflare.ManagedTransforms.ManagedTransforms";
/**
 * The managed request/response header transforms of a Cloudflare zone
 * (`/zones/{zone_id}/managed_headers`) — a zone-scoped **singleton**: every
 * zone always carries the full catalog of managed transforms (each with an
 * enabled flag), so there is no create or delete on the Cloudflare side.
 *
 * Reconciling this resource adopts the singleton and patches **only the
 * transform ids you name** in `requestHeaders` / `responseHeaders` — every
 * other transform is left exactly as found (dashboard- or otherwise-managed
 * toggles are never clobbered).
 *
 * On destroy, the resource restores the ids it managed to the enabled
 * states observed before its first write (the `initialRequestHeaders` /
 * `initialResponseHeaders` snapshots). Transforms that were never named are
 * not touched.
 *
 * Some transforms are plan-gated (e.g. `add_bot_protection_headers`
 * requires Bot Management) — enabling those fails server-side on
 * unentitled zones.
 * ### Request transforms
 * **Example:** Add visitor location headers
 * ```typescript
 * yield* Cloudflare.ManagedTransforms.ManagedTransforms("Transforms", {
 *   zoneId: zone.zoneId,
 *   requestHeaders: { add_visitor_location_headers: true },
 * });
 * ```
 *
 * **Example:** Remove visitor IP headers
 * ```typescript
 * yield* Cloudflare.ManagedTransforms.ManagedTransforms("Transforms", {
 *   zoneId: zone.zoneId,
 *   requestHeaders: { remove_visitor_ip_headers: true },
 * });
 * ```
 *
 * ### Response transforms
 * **Example:** Harden responses
 * ```typescript
 * yield* Cloudflare.ManagedTransforms.ManagedTransforms("Transforms", {
 *   zoneId: zone.zoneId,
 *   responseHeaders: {
 *     add_security_headers: true,
 *     "remove_x-powered-by_header": true,
 *   },
 * });
 * ```
 *
 * ### Mixed
 * **Example:** Manage request and response transforms together
 * ```typescript
 * yield* Cloudflare.ManagedTransforms.ManagedTransforms("Transforms", {
 *   zoneId: zone.zoneId,
 *   requestHeaders: { add_true_client_ip_headers: true },
 *   responseHeaders: { "remove_x-powered-by_header": false },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/rules/transform/managed-transforms/
 *
 * @resource
 * @product Managed Transforms
 * @category Rules & Configuration
 */
export const ManagedTransforms = Resource(TypeId, {
    aliases: ["Cloudflare.ManagedTransforms"],
});
/**
 * Returns true if the given value is a ManagedTransforms resource.
 */
export const isManagedTransforms = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const ManagedTransformsProvider = () => Provider.succeed(ManagedTransforms, {
    nuke: { singleton: true },
    stables: ["zoneId", "initialRequestHeaders", "initialResponseHeaders"],
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // The managed-transforms catalog is a per-zone singleton with no
        // account-wide list — enumerate every zone and read its catalog.
        const allZones = yield* listAllZones(accountId);
        const rows = yield* Effect.forEach(allZones.map((zone) => zone.id), (zoneId) => observe(zoneId).pipe(Effect.map((observed) => observed === undefined
            ? undefined
            : // Cold enumeration adopts the singleton freely — the
                // observed enabled states become the snapshot baseline,
                // matching the `read` cold-adopt path.
                toAttributes(zoneId, observed, snapshot(observed.managedRequestHeaders), snapshot(observed.managedResponseHeaders)))), { concurrency: 10 });
        return rows.filter((row) => row !== undefined);
    }),
    diff: Effect.fn(function* ({ olds = {}, news, output }) {
        const o = olds;
        const n = news;
        // zoneId is Input<string>; compare only when both sides are concrete.
        const oldZone = output?.zoneId ?? o.zoneId;
        if (typeof oldZone === "string" &&
            typeof n.zoneId === "string" &&
            oldZone !== n.zoneId) {
            return { action: "replace" };
        }
    }),
    read: Effect.fn(function* ({ output, olds }) {
        // The transform catalog is a singleton — it exists iff the zone does.
        const zoneId = output?.zoneId ?? olds?.zoneId;
        if (!zoneId)
            return undefined;
        const observed = yield* observe(zoneId);
        if (!observed)
            return undefined;
        // Singletons always exist with Cloudflare defaults — there is nothing
        // to "own", so a cold read adopts freely (never `Unowned`). The
        // enabled states observed at adoption time become the snapshot
        // restored on destroy.
        return toAttributes(zoneId, observed, output?.initialRequestHeaders ??
            snapshot(observed.managedRequestHeaders), output?.initialResponseHeaders ??
            snapshot(observed.managedResponseHeaders));
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        // Inputs are resolved to concrete strings by Plan.
        const zoneId = news.zoneId;
        // 1. Observe — the singleton always exists for a live zone.
        let observed = normalize(yield* managedTransforms.listManagedTransforms({ zoneId }));
        // 2. Snapshot — capture pre-management enabled states once; `output`
        //    acts as the cache that keeps the very first observation sticky.
        const initialRequestHeaders = output?.initialRequestHeaders ??
            snapshot(observed.managedRequestHeaders);
        const initialResponseHeaders = output?.initialResponseHeaders ??
            snapshot(observed.managedResponseHeaders);
        // 3. Sync — diff the managed ids' desired enabled flags against the
        //    observed states and PATCH only the deltas. Unnamed transforms
        //    are never sent, so they stay exactly as found.
        const requestDelta = delta(news.requestHeaders ?? {}, observed.managedRequestHeaders);
        const responseDelta = delta(news.responseHeaders ?? {}, observed.managedResponseHeaders);
        if (requestDelta.length > 0 || responseDelta.length > 0) {
            observed = normalize(yield* managedTransforms.patchManagedTransform({
                zoneId,
                managedRequestHeaders: requestDelta,
                managedResponseHeaders: responseDelta,
            }));
        }
        // 4. Return fresh attributes.
        return toAttributes(zoneId, observed, initialRequestHeaders, initialResponseHeaders);
    }),
    delete: Effect.fn(function* ({ output, olds }) {
        // Singleton — nothing to delete on the Cloudflare side. Restore the
        // ids this resource managed (i.e. the ones named in the last-applied
        // props) to their pre-management snapshot values. Ids missing from
        // the snapshot (added by Cloudflare after adoption) are left as-is.
        const observed = yield* observe(output.zoneId);
        if (!observed)
            return; // zone is gone — nothing to restore
        const o = (olds ?? {});
        const requestRestore = restoreDelta(o.requestHeaders ?? {}, output.initialRequestHeaders ?? {}, observed.managedRequestHeaders);
        const responseRestore = restoreDelta(o.responseHeaders ?? {}, output.initialResponseHeaders ?? {}, observed.managedResponseHeaders);
        if (requestRestore.length > 0 || responseRestore.length > 0) {
            yield* managedTransforms
                .patchManagedTransform({
                zoneId: output.zoneId,
                managedRequestHeaders: requestRestore,
                managedResponseHeaders: responseRestore,
            })
                .pipe(Effect.catchTag("InvalidRoute", () => Effect.void));
        }
    }),
});
/**
 * Cloudflare returns `null` (not `[]`) for a transform list when the zone's
 * plan offers no transforms of that kind (e.g. all managed request
 * transforms are plan-gated on free zones). Normalize to empty arrays so the
 * rest of the provider only deals in lists.
 */
const normalize = (response) => ({
    managedRequestHeaders: response.managedRequestHeaders ?? [],
    managedResponseHeaders: response.managedResponseHeaders ?? [],
});
/**
 * Read the zone's managed transforms, mapping a dead zone (`InvalidRoute`,
 * Cloudflare code 7003) to `undefined`.
 */
const observe = (zoneId) => managedTransforms.listManagedTransforms({ zoneId }).pipe(Effect.map(normalize), Effect.catchTag("InvalidRoute", () => Effect.succeed(undefined)));
/**
 * Project an observed transform list onto an id → enabled snapshot map.
 */
const snapshot = (transforms) => {
    const out = {};
    for (const t of transforms)
        out[t.id] = t.enabled;
    return out;
};
/**
 * The PATCH entries needed to bring the managed ids to their desired
 * enabled states — only ids whose observed state differs are included, so
 * a no-op reconcile sends nothing.
 */
const delta = (desired, observed) => {
    const current = snapshot(observed);
    const out = [];
    for (const [id, enabled] of Object.entries(desired)) {
        if (enabled !== undefined && current[id] !== enabled) {
            out.push({ id, enabled });
        }
    }
    return out;
};
/**
 * The PATCH entries needed to restore the managed ids to their snapshot
 * values — only ids that were managed, have a snapshot value, and currently
 * differ from it are included (idempotent re-delete after a crashed run).
 */
const restoreDelta = (managed, initial, observed) => {
    const current = snapshot(observed);
    const out = [];
    for (const id of Object.keys(managed)) {
        if (managed[id] === undefined)
            continue;
        const original = initial[id];
        if (original !== undefined && current[id] !== original) {
            out.push({ id, enabled: original });
        }
    }
    return out;
};
const toState = (t) => ({
    id: t.id,
    enabled: t.enabled,
    hasConflict: t.hasConflict,
    conflictsWith: t.conflictsWith == null ? undefined : [...t.conflictsWith],
});
const toAttributes = (zoneId, observed, initialRequestHeaders, initialResponseHeaders) => ({
    zoneId,
    requestHeaders: observed.managedRequestHeaders.map(toState),
    responseHeaders: observed.managedResponseHeaders.map(toState),
    initialRequestHeaders,
    initialResponseHeaders,
});
//# sourceMappingURL=ManagedTransforms.js.map