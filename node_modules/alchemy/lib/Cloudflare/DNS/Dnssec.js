import * as dns from "@distilled.cloud/cloudflare/dns";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Schedule from "effect/Schedule";
import { Unowned } from "../../AdoptPolicy.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { listAllZones } from "../Zone/lookup.js";
const TypeId = "Cloudflare.DNS.Dnssec";
/**
 * DNSSEC configuration for a Cloudflare zone
 * (`/zones/{zone_id}/dnssec`).
 *
 * DNSSEC is a per-zone singleton — it always exists in either an
 * enabled or disabled state, so this resource never creates or deletes
 * anything physical. Reconcile patches the configuration toward the
 * desired state; destroy restores the state the zone had before
 * Alchemy first managed it (enabled stays enabled, previously-disabled
 * zones are deactivated again).
 *
 * Activation is eventually consistent: after enabling, Cloudflare
 * reports `pending` until the `ds` attribute (the DS record) is
 * submitted at the domain's registrar. The reconciler polls with
 * bounded retries for the zone to leave the `disabled` state but does
 * not wait for full `active` — that depends on the registrar.
 *
 * Safety: when there is no prior state and DNSSEC is already enabled
 * on the zone, `read` reports it as `Unowned` and the engine refuses
 * to take it over unless `--adopt` (or `adopt(true)`) is set.
 * ### Enabling DNSSEC
 * **Example:** Sign the zone
 * ```typescript
 * const dnssec = yield* Cloudflare.DNS.Dnssec("ZoneDnssec", {
 *   zoneId: zone.zoneId,
 * });
 * // Paste `dnssec.ds` at your registrar to complete activation.
 * ```
 *
 * **Example:** Multi-signer DNSSEC
 * ```typescript
 * yield* Cloudflare.DNS.Dnssec("ZoneDnssec", {
 *   zoneId: zone.zoneId,
 *   dnssecMultiSigner: true,
 * });
 * ```
 *
 * ### Disabling DNSSEC
 * **Example:** Keep DNSSEC explicitly off
 * ```typescript
 * yield* Cloudflare.DNS.Dnssec("ZoneDnssec", {
 *   zoneId: zone.zoneId,
 *   status: "disabled",
 * });
 * ```
 *
 * @resource
 * @product DNS
 * @category Domains & DNS
 */
export const Dnssec = Resource(TypeId, {
    aliases: ["Cloudflare.Dns.Dnssec"],
});
/**
 * Returns true if the given value is a Dnssec resource.
 */
export const issec = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const DnssecProvider = () => Provider.succeed(Dnssec, {
    stables: [
        "zoneId",
        "initialStatus",
        "initialMultiSigner",
        "initialPresigned",
        "initialUseNsec3",
    ],
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // No account-wide API for this zone singleton — enumerate every
        // zone in the account and read its DNSSEC config (every zone has
        // one). Disabled zones are "not created" for this resource (same
        // as a cold `read`), so they're skipped; the observed state of an
        // active zone becomes its captured initial state.
        const allZones = yield* listAllZones(accountId);
        const rows = yield* Effect.forEach(allZones.map((zone) => zone.id), (zoneId) => dns.getDnssec({ zoneId }).pipe(Effect.map((observed) => statusFamily(observed.status) === "disabled"
            ? undefined
            : toAttributes(zoneId, observed, captureInitial(observed))), 
        // Plan-gated or partial zones reject the route; skip them.
        Effect.catchTag("InvalidRoute", () => Effect.succeed(undefined))), { concurrency: 10 });
        return rows.filter((row) => row !== undefined);
    }),
    diff: Effect.fn(function* ({ olds = {}, news, output }) {
        const o = olds;
        const n = news;
        // zoneId is the resource's identity (DNSSEC is a zone singleton).
        // It is Input<string>; compare only once both sides are concrete.
        const oldZoneId = output?.zoneId ?? (typeof o.zoneId === "string" ? o.zoneId : undefined);
        if (oldZoneId !== undefined &&
            typeof n.zoneId === "string" &&
            oldZoneId !== n.zoneId) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ output, olds }) {
        const zoneId = output?.zoneId ??
            (typeof olds?.zoneId === "string" ? olds.zoneId : undefined);
        if (!zoneId)
            return undefined;
        const observed = yield* dns.getDnssec({ zoneId }).pipe(
        // Zone deleted out-of-band — DNSSEC config is gone with it.
        Effect.catchTag("InvalidRoute", () => Effect.succeed(undefined)));
        if (observed === undefined)
            return undefined;
        if (output !== undefined) {
            // Owned path — refresh, keeping the captured pre-management state.
            return toAttributes(zoneId, observed, {
                status: output.initialStatus,
                multiSigner: output.initialMultiSigner,
                presigned: output.initialPresigned,
                useNsec3: output.initialUseNsec3,
            });
        }
        // Cold read: DNSSEC disabled means "not created" for this resource.
        if (statusFamily(observed.status) === "disabled")
            return undefined;
        // DNSSEC is enabled but we have no state and no ownership markers
        // exist — gate takeover behind the adopt policy.
        return Unowned(toAttributes(zoneId, observed, captureInitial(observed)));
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        // Inputs have been resolved to concrete strings by Plan.
        const zoneId = news.zoneId;
        const desiredStatus = news.status ?? "active";
        // 1. Observe — DNSSEC config always exists for a live zone.
        let observed = yield* dns.getDnssec({ zoneId });
        // 2. Capture — the pre-management state, restored on destroy.
        //    `output` (including an adoption read) already carries it;
        //    otherwise this is our first touch.
        const initial = output !== undefined
            ? {
                status: output.initialStatus,
                multiSigner: output.initialMultiSigner,
                presigned: output.initialPresigned,
                useNsec3: output.initialUseNsec3,
            }
            : captureInitial(observed);
        // 3. Sync — patch only when the observed state differs from the
        //    desired one.
        if (!matchesDesired(observed, news, desiredStatus)) {
            observed = yield* dns.patchDnssec({
                zoneId,
                status: desiredStatus,
                dnssecMultiSigner: news.dnssecMultiSigner,
                dnssecPresigned: news.dnssecPresigned,
                dnssecUseNsec3: news.dnssecUseNsec3,
            });
        }
        // 4. Wait — activation/deactivation is eventually consistent.
        //    Poll (bounded) for the status to reach the desired family;
        //    "active" is satisfied by `pending` since full activation
        //    requires the registrar-side DS record.
        if (statusFamily(observed.status) !== desiredStatus) {
            observed = yield* dns.getDnssec({ zoneId }).pipe(Effect.repeat({
                schedule: Schedule.spaced("2 seconds"),
                until: (o) => statusFamily(o.status) === desiredStatus,
                times: 15,
            }));
        }
        return toAttributes(zoneId, observed, initial);
    }),
    delete: Effect.fn(function* ({ output }) {
        const zoneId = output.zoneId;
        // Observe — if the zone itself is gone, so is its DNSSEC config.
        const observed = yield* dns
            .getDnssec({ zoneId })
            .pipe(Effect.catchTag("InvalidRoute", () => Effect.succeed(undefined)));
        if (observed === undefined)
            return;
        if (output.initialStatus === "disabled") {
            // The zone had DNSSEC off before we managed it — deactivate.
            // Cloudflare's DELETE endpoint only clears DNSSEC records *after*
            // signing has been disabled, so deactivation goes through PATCH.
            // Skip the call when it's already off (idempotent re-delete).
            if (statusFamily(observed.status) === "disabled")
                return;
            yield* dns
                .patchDnssec({ zoneId, status: "disabled" })
                .pipe(Effect.catchTag("InvalidRoute", () => Effect.void));
            return;
        }
        // The zone had DNSSEC on before we managed it — restore the
        // enabled state and the flags it had at capture time.
        if (statusFamily(observed.status) === "active" &&
            flag(observed.dnssecMultiSigner) === flag(output.initialMultiSigner) &&
            flag(observed.dnssecPresigned) === flag(output.initialPresigned) &&
            flag(observed.dnssecUseNsec3) === flag(output.initialUseNsec3)) {
            return;
        }
        yield* dns
            .patchDnssec({
            zoneId,
            status: "active",
            dnssecMultiSigner: output.initialMultiSigner,
            dnssecPresigned: output.initialPresigned,
            dnssecUseNsec3: output.initialUseNsec3,
        })
            .pipe(Effect.catchTag("InvalidRoute", () => Effect.void));
    }),
});
/**
 * Collapse Cloudflare's five-state live status into the two-state
 * desired family (`pending` is on its way to `active`,
 * `pending-disabled` / `error` / unknown collapse to `disabled`).
 */
const statusFamily = (status) => status === "active" || status === "pending" ? "active" : "disabled";
const flag = (v) => v ?? false;
const captureInitial = (observed) => ({
    status: statusFamily(observed.status),
    multiSigner: observed.dnssecMultiSigner ?? undefined,
    presigned: observed.dnssecPresigned ?? undefined,
    useNsec3: observed.dnssecUseNsec3 ?? undefined,
});
const matchesDesired = (observed, news, desiredStatus) => {
    if (statusFamily(observed.status) !== desiredStatus)
        return false;
    if (news.dnssecMultiSigner !== undefined &&
        news.dnssecMultiSigner !== flag(observed.dnssecMultiSigner)) {
        return false;
    }
    if (news.dnssecPresigned !== undefined &&
        news.dnssecPresigned !== flag(observed.dnssecPresigned)) {
        return false;
    }
    if (news.dnssecUseNsec3 !== undefined &&
        news.dnssecUseNsec3 !== flag(observed.dnssecUseNsec3)) {
        return false;
    }
    return true;
};
const undef = (v) => v == null ? undefined : v;
const toAttributes = (zoneId, observed, initial) => ({
    zoneId,
    status: observed.status ?? "disabled",
    dnssecMultiSigner: undef(observed.dnssecMultiSigner),
    dnssecPresigned: undef(observed.dnssecPresigned),
    dnssecUseNsec3: undef(observed.dnssecUseNsec3),
    algorithm: undef(observed.algorithm),
    digest: undef(observed.digest),
    digestAlgorithm: undef(observed.digestAlgorithm),
    digestType: undef(observed.digestType),
    ds: undef(observed.ds),
    flags: undef(observed.flags),
    keyTag: undef(observed.keyTag),
    keyType: undef(observed.keyType),
    publicKey: undef(observed.publicKey),
    modifiedOn: undef(observed.modifiedOn),
    initialStatus: initial.status,
    initialMultiSigner: initial.multiSigner,
    initialPresigned: initial.presigned,
    initialUseNsec3: initial.useNsec3,
});
//# sourceMappingURL=Dnssec.js.map