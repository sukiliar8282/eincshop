import * as dns from "@distilled.cloud/cloudflare/dns";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const DnsViewTypeId = "Cloudflare.DNS.View";
/**
 * An Internal DNS view (`/accounts/{account_id}/dns_settings/views`) —
 * a named set of internal zones that DNS queries can be resolved
 * against, for split-horizon / internal DNS setups.
 *
 * Requires the Enterprise Internal DNS entitlement on the account
 * (creation fails with `InternalDnsNotAvailable` otherwise). Both
 * `name` and `zones` are mutable in place.
 * ### Creating a View
 * **Example:** View over internal zones
 * ```typescript
 * const view = yield* Cloudflare.DNS.View("Internal", {
 *   zones: [internalZone.zoneId],
 * });
 * ```
 *
 * **Example:** View with an explicit name
 * ```typescript
 * const view = yield* Cloudflare.DNS.View("Internal", {
 *   name: "datacenter-east",
 *   zones: [zoneA.zoneId, zoneB.zoneId],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/dns/internal-dns/
 *
 * @resource
 * @product DNS
 * @category Domains & DNS
 */
export const View = Resource(DnsViewTypeId, {
    aliases: ["Cloudflare.Dns.View"],
});
/**
 * Returns true if the given value is a View resource.
 */
export const isView = (value) => Predicate.hasProperty(value, "Type") && value.Type === DnsViewTypeId;
export const ViewProvider = () => Provider.succeed(View, {
    stables: ["viewId", "accountId", "createdTime"],
    // Account collection — internal DNS views are enumerated per account
    // via the paginated list endpoint. Each item already carries the full
    // observed shape, so map straight into the `read` Attributes.
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* dns.listSettingAccountViews.pages({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((view) => toAttributes(view, accountId)))));
    }),
    diff: Effect.fn(function* ({ output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        if (output !== undefined && output.accountId !== accountId) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        if (output?.viewId) {
            const observed = yield* getView(acct, output.viewId);
            return observed ? toAttributes(observed, acct) : undefined;
        }
        // Cold read — recover from lost state by matching the
        // deterministic physical name. Views carry no ownership markers,
        // so gate takeover behind adoption.
        const name = yield* createViewName(id, olds?.name);
        const match = yield* findByName(acct, name);
        return match ? Unowned(toAttributes(match, acct)) : undefined;
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const name = yield* createViewName(id, news.name);
        // Inputs are resolved to concrete values by Plan.
        const zones = news.zones;
        // Observe — the id cached on `output` is a hint, not a guarantee.
        const observed = output?.viewId
            ? yield* getView(output.accountId ?? accountId, output.viewId)
            : undefined;
        if (!observed) {
            // Ensure — greenfield (or out-of-band delete). Names are not
            // unique, so there is no AlreadyExists race to tolerate.
            const created = yield* dns.createSettingAccountView({
                accountId,
                name,
                zones,
            });
            return toAttributes(created, accountId);
        }
        // Sync — patch only when the observed view differs.
        if (observed.name === name && sameZones(observed.zones, zones)) {
            return toAttributes(observed, output?.accountId ?? accountId);
        }
        const updated = yield* dns.patchSettingAccountView({
            accountId: output?.accountId ?? accountId,
            viewId: observed.id,
            name,
            zones,
        });
        return toAttributes(updated, output?.accountId ?? accountId);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* dns
            .deleteSettingAccountView({
            accountId: output.accountId,
            viewId: output.viewId,
        })
            .pipe(Effect.catchTag("ViewNotFound", () => Effect.void));
    }),
});
/** Read a view by id, mapping "gone" (code 1015) to `undefined`. */
const getView = (accountId, viewId) => dns
    .getSettingAccountView({ accountId, viewId })
    .pipe(Effect.catchTag("ViewNotFound", () => Effect.succeed(undefined)));
/**
 * Find a view by exact name. The `name.exact` filter narrows
 * server-side; re-check exactly client-side and pick the oldest for
 * determinism.
 */
const findByName = (accountId, name) => dns.listSettingAccountViews({ accountId, name: { exact: name } }).pipe(Effect.map((list) => list.result
    .filter((v) => v.name === name)
    .sort((a, b) => a.createdTime.localeCompare(b.createdTime))
    .at(0)));
const createViewName = (id, name) => Effect.gen(function* () {
    return name ?? (yield* createPhysicalName({ id, lowercase: true }));
});
const sameZones = (observed, desired) => observed.length === desired.length &&
    [...observed].sort().join(",") === [...desired].sort().join(",");
const toAttributes = (view, accountId) => ({
    viewId: view.id,
    accountId,
    name: view.name,
    zones: [...view.zones],
    createdTime: view.createdTime,
    modifiedTime: view.modifiedTime,
});
//# sourceMappingURL=View.js.map