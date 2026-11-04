import * as certificateAuthorities from "@distilled.cloud/cloudflare/certificate-authorities";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import { Unowned } from "../../AdoptPolicy.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { listAllZones } from "../Zone/lookup.js";
const TypeId = "Cloudflare.CertificateAuthorities.HostnameAssociation";
/**
 * The set of hostnames in a Cloudflare zone that enforce mTLS, optionally
 * keyed by an uploaded mTLS CA certificate.
 *
 * Cloudflare models this as a settings singleton per
 * `(zone, mtls_certificate_id)` pair — a pure GET/PUT API over
 * `/zones/{zone_id}/certificate_authorities/hostname_associations`. With no
 * `mtlsCertificateId`, the hostnames are associated with the zone's active
 * Cloudflare Managed CA; with one, they are associated with that uploaded CA
 * certificate. Destroying the resource clears the association (PUT of an
 * empty hostname list).
 *
 * Safety: when there is no prior state but the keyed association already has
 * hostnames, `read` reports the existing list as `Unowned` — the engine
 * refuses to take it over (and would otherwise clobber a hand-managed list)
 * unless `--adopt` or `adopt(true)` is set.
 *
 * Note: an mTLS CA certificate cannot be deleted while hostname associations
 * still reference it. Pass the certificate id through
 * `cert.mtlsCertificateId` so the engine destroys the association before the
 * certificate.
 * ### Cloudflare Managed CA
 * **Example:** Enforce mTLS on a hostname with the Managed CA
 * ```typescript
 * yield* Cloudflare.CertificateAuthorities.HostnameAssociation("MtlsHosts", {
 *   zoneId: zone.zoneId,
 *   hostnames: ["api.example.com"],
 * });
 * ```
 *
 * ### Uploaded CA certificate
 * **Example:** Associate hostnames with an uploaded CA
 * ```typescript
 * const ca = yield* Cloudflare.MtlsCertificate.MtlsCertificate("ClientCa", {
 *   ca: true,
 *   certificates: caPem,
 * });
 *
 * yield* Cloudflare.CertificateAuthorities.HostnameAssociation("ClientCaHosts", {
 *   zoneId: zone.zoneId,
 *   mtlsCertificateId: ca.mtlsCertificateId,
 *   hostnames: ["api.example.com", "admin.example.com"],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/api/resources/certificate_authorities/subresources/hostname_associations/
 *
 * @resource
 * @product Certificate Authorities
 * @category SSL/TLS & Certificates
 */
export const HostnameAssociation = Resource(TypeId);
/**
 * Returns true if the given value is a HostnameAssociation resource.
 */
export const isHostnameAssociation = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const HostnameAssociationProvider = () => Provider.succeed(HostnameAssociation, {
    stables: ["zoneId", "mtlsCertificateId"],
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // The association is a per-zone settings singleton with no
        // account-wide enumeration API. The only enumerable key is the
        // zone's active Cloudflare Managed CA (no `mtlsCertificateId`):
        // associations keyed by an uploaded CA can't be enumerated because
        // there is no API to list the certificate ids in play. Fan out over
        // every zone and read its Managed-CA association.
        const zones = yield* listAllZones(accountId);
        const rows = yield* Effect.forEach(zones, (zone) => certificateAuthorities
            .getHostnameAssociation({ zoneId: zone.id })
            .pipe(Effect.map((observed) => {
            const hostnames = [...(observed.hostnames ?? [])];
            // An empty list is the singleton's "unconfigured"
            // state — nothing exists to enumerate (matches `read`).
            if (hostnames.length === 0)
                return undefined;
            return {
                zoneId: zone.id,
                mtlsCertificateId: undefined,
                hostnames,
            };
        }), 
        // Zones without the mTLS entitlement reject the route
        // (Forbidden) or aren't routable (InvalidRoute); skip them.
        Effect.catchTag(["Forbidden", "InvalidRoute"], () => Effect.succeed(undefined))), { concurrency: 10 });
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
        // mtlsCertificateId keys the association — `undefined` (Managed CA)
        // is itself an identity value.
        const oldCertId = output !== undefined
            ? output.mtlsCertificateId
            : typeof o.mtlsCertificateId === "string"
                ? o.mtlsCertificateId
                : undefined;
        // A presence flip (Managed CA <-> uploaded CA) is decidable even when
        // the new side is an unresolved Input reference — the reference itself
        // proves a certificate now keys (or no longer keys) the association.
        if ((oldCertId === undefined) !== (n.mtlsCertificateId === undefined)) {
            return { action: "replace" };
        }
        // Both sides keyed by a certificate: compare only once the new side is
        // a concrete string (an unresolved Input may still resolve to the same
        // id, so we leave that case to the engine's default update).
        if (typeof n.mtlsCertificateId === "string" &&
            oldCertId !== n.mtlsCertificateId) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ output, olds }) {
        const zoneId = output?.zoneId ??
            (typeof olds?.zoneId === "string" ? olds.zoneId : undefined);
        if (!zoneId)
            return undefined;
        const mtlsCertificateId = output !== undefined
            ? output.mtlsCertificateId
            : typeof olds?.mtlsCertificateId === "string"
                ? olds.mtlsCertificateId
                : undefined;
        const observed = yield* certificateAuthorities.getHostnameAssociation({
            zoneId,
            mtlsCertificateId,
        });
        const hostnames = [...(observed.hostnames ?? [])];
        // An empty list is the singleton's "unconfigured" state — nothing
        // exists to refresh or adopt.
        if (hostnames.length === 0)
            return undefined;
        const attrs = {
            zoneId,
            mtlsCertificateId,
            hostnames,
        };
        // Cold read with a non-empty pre-existing list: the association
        // carries no ownership markers, so we cannot prove we created it —
        // gate the takeover behind the adopt policy.
        return output !== undefined ? attrs : Unowned(attrs);
    }),
    reconcile: Effect.fn(function* ({ news }) {
        // Inputs have been resolved to concrete strings by Plan.
        const zoneId = news.zoneId;
        const mtlsCertificateId = news.mtlsCertificateId;
        const desired = (news.hostnames ?? []);
        // 1. Observe — the association always "exists" (possibly empty);
        //    read the live hostname list.
        const observed = yield* certificateAuthorities.getHostnameAssociation({
            zoneId,
            mtlsCertificateId,
        });
        const current = [...(observed.hostnames ?? [])];
        // 2. Sync — full PUT of the desired list; skip when the observed
        //    set already matches (order is not significant).
        if (hostnameSetEquals(current, desired)) {
            return { zoneId, mtlsCertificateId, hostnames: current };
        }
        const updated = yield* certificateAuthorities.putHostnameAssociation({
            zoneId,
            mtlsCertificateId,
            hostnames: desired,
        });
        return {
            zoneId,
            mtlsCertificateId,
            hostnames: [...(updated.hostnames ?? desired)],
        };
    }),
    delete: Effect.fn(function* ({ output }) {
        // The association is a settings singleton — "delete" means clearing
        // the hostname list. PUT of an empty list is naturally idempotent.
        yield* certificateAuthorities.putHostnameAssociation({
            zoneId: output.zoneId,
            mtlsCertificateId: output.mtlsCertificateId,
            hostnames: [],
        });
    }),
});
/** Order-insensitive equality of two hostname lists (exact duplicates kept). */
const hostnameSetEquals = (a, b) => {
    if (a.length !== b.length)
        return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((v, i) => v === sortedB[i]);
};
//# sourceMappingURL=HostnameAssociation.js.map