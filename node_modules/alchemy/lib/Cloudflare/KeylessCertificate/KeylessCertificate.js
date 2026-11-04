import * as keylessCertificates from "@distilled.cloud/cloudflare/keyless-certificates";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { listAllZones } from "../Zone/lookup.js";
const TypeId = "Cloudflare.KeylessCertificate.KeylessCertificate";
/**
 * A zone-level Keyless SSL configuration — serve TLS for a certificate whose
 * private key stays on your own key server instead of being uploaded to
 * Cloudflare.
 *
 * You upload only the certificate (and intermediates); Cloudflare reaches out
 * to an externally running [gokeyless](https://github.com/cloudflare/gokeyless)
 * key server at `host:port` (optionally through a Cloudflare Tunnel) for every
 * private-key operation.
 *
 * Keyless SSL is an **Enterprise-only** feature: on zones without the
 * entitlement, creation fails with the typed `KeylessSslNotAvailable` error
 * (Cloudflare code 1067).
 *
 * `host`, `port`, `name`, `enabled`, and `tunnel` are mutable in place;
 * `certificate` and `bundleMethod` are create-only and trigger a replacement.
 * ### Creating a Keyless SSL configuration
 * **Example:** Basic key server over the public internet
 * ```typescript
 * const keyless = yield* Cloudflare.KeylessCertificate.KeylessCertificate("SiteKeyless", {
 *   zoneId: zone.zoneId,
 *   certificate: certPem, // PEM, private key stays on your key server
 *   host: "keyless.example.com",
 *   port: 24008,
 * });
 * ```
 *
 * **Example:** Read the certificate from disk
 * ```typescript
 * const fs = yield* FileSystem.FileSystem;
 * const certificate = yield* fs.readFileString("certs/site.pem");
 *
 * const keyless = yield* Cloudflare.KeylessCertificate.KeylessCertificate("SiteKeyless", {
 *   zoneId: zone.zoneId,
 *   certificate,
 *   host: "keyless.example.com",
 * });
 * ```
 *
 * ### Reaching the key server through a Cloudflare Tunnel
 * **Example:** Private key server on a tunnel virtual network
 * ```typescript
 * const vnet = yield* Cloudflare.Tunnel.VirtualNetwork("KeylessVnet", {});
 *
 * const keyless = yield* Cloudflare.KeylessCertificate.KeylessCertificate("SiteKeyless", {
 *   zoneId: zone.zoneId,
 *   certificate: certPem,
 *   host: "keyless.internal",
 *   port: 24008,
 *   tunnel: {
 *     privateIp: "10.0.0.10",
 *     vnetId: vnet.vnetId,
 *   },
 * });
 * ```
 *
 * ### Rotation
 * **Example:** Rotate by changing the certificate
 * ```typescript
 * // `certificate` is create-only — changing it replaces the configuration:
 * // the new one is created and the old one is deleted.
 * const keyless = yield* Cloudflare.KeylessCertificate.KeylessCertificate("SiteKeyless", {
 *   zoneId: zone.zoneId,
 *   certificate: rotatedCertPem,
 *   host: "keyless.example.com",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/ssl/keyless-ssl/
 *
 * @resource
 * @product Keyless Certificates
 * @category SSL/TLS & Certificates
 */
export const KeylessCertificate = Resource(TypeId, {
    aliases: ["Cloudflare.KeylessCertificate"],
});
/**
 * Returns true if the given value is a KeylessCertificate resource.
 */
export const isKeylessCertificate = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const KeylessCertificateProvider = () => Provider.succeed(KeylessCertificate, {
    stables: ["keylessCertificateId", "zoneId", "createdOn"],
    // Keyless SSL is zone-scoped (`/zones/{id}/keyless_certificates`) with no
    // account-wide enumeration API. Fan out over every zone in the account,
    // list its Keyless SSL configurations, and hydrate each into the exact
    // `read` Attributes shape. Zones without the Enterprise entitlement reject
    // the route with the typed `Forbidden` error — skip them.
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const zones = yield* listAllZones(accountId);
        const rows = yield* Effect.forEach(zones, (zone) => keylessCertificates.listKeylessCertificates
            .pages({ zoneId: zone.id })
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? [])
            .filter((keyless) => keyless.status !== "deleted")
            .map((keyless) => toAttributes({ ...keyless, permissions: [...keyless.permissions] }, zone.id)))), 
        // Non-entitled / plan-gated zones reject Keyless SSL listing.
        Effect.catchTag("Forbidden", () => Effect.succeed([]))), { concurrency: 10 });
        return rows.flat();
    }),
    diff: Effect.fn(function* ({ olds, news }) {
        // diff runs during plan — `news` may still contain unresolved Outputs.
        if (!isResolved(news))
            return undefined;
        // No prior props to compare against — let the engine decide.
        if (olds?.certificate === undefined)
            return undefined;
        // The PATCH API has no certificate field — rotation replaces.
        if (normalizePem(olds.certificate) !== normalizePem(news.certificate)) {
            return { action: "replace" };
        }
        // bundleMethod is create-only.
        if ((olds.bundleMethod ?? "ubiquitous") !==
            (news.bundleMethod ?? "ubiquitous")) {
            return { action: "replace" };
        }
        // The PATCH API can set a tunnel but cannot clear one — removing it
        // requires a replacement. (Adding/changing is an in-place update.)
        if (olds.tunnel !== undefined && news.tunnel === undefined) {
            return { action: "replace" };
        }
        // zoneId is Input<string>; compare only once both are concrete.
        if (typeof olds.zoneId === "string" &&
            typeof news.zoneId === "string" &&
            olds.zoneId !== news.zoneId) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const zoneId = output?.zoneId ?? olds?.zoneId;
        if (zoneId === undefined)
            return undefined;
        // Owned path: refresh by our persisted identifier. Cloudflare keeps a
        // tombstone with status "deleted" for a while — report it as gone.
        if (output?.keylessCertificateId) {
            const observed = yield* getKeylessCertificate(zoneId, output.keylessCertificateId);
            return observed ? toAttributes(observed, zoneId) : undefined;
        }
        // Cold read — recover from lost state by matching the deterministic
        // physical name. Names are not unique on Cloudflare's side; an exact
        // match on our generated/explicit name is the best identity we have.
        const name = yield* createKeylessName(id, olds?.name);
        const match = yield* findByName(zoneId, name);
        return match ? toAttributes(match, zoneId) : undefined;
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        // Inputs have been resolved to concrete strings by Plan.
        const zoneId = news.zoneId;
        const name = yield* createKeylessName(id, news.name);
        const desiredTunnel = resolveTunnel(news.tunnel);
        // 1. Observe — the identifier cached on `output` is a hint, not a
        //    guarantee: a missing (or tombstoned "deleted") configuration
        //    falls through to the name scan and then to create.
        let observed = output?.keylessCertificateId
            ? yield* getKeylessCertificate(zoneId, output.keylessCertificateId)
            : undefined;
        // 2. Fall back to scanning the zone for a configuration carrying our
        //    deterministic physical name (recovers from lost state).
        if (!observed) {
            observed = yield* findByName(zoneId, name);
        }
        // 3. Ensure — create when missing. Names are not unique on
        //    Cloudflare's side, so there is no AlreadyExists race to
        //    tolerate. On zones without the Enterprise entitlement this
        //    fails with the typed `KeylessSslNotAvailable` error.
        if (!observed) {
            observed = yield* keylessCertificates.createKeylessCertificate({
                zoneId,
                certificate: news.certificate,
                host: news.host,
                port: news.port ?? 24008,
                name,
                bundleMethod: news.bundleMethod,
                tunnel: desiredTunnel,
            });
        }
        // 4. Sync — diff observed cloud state against desired and patch only
        //    when something actually differs; skip the call on a no-op.
        //    `enabled` is create-time defaulted by Cloudflare, so it is only
        //    compared when explicitly configured.
        const desired = {
            name,
            host: news.host,
            port: news.port ?? 24008,
        };
        const dirty = observed.name !== desired.name ||
            observed.host !== desired.host ||
            observed.port !== desired.port ||
            (news.enabled !== undefined && observed.enabled !== news.enabled) ||
            (desiredTunnel !== undefined &&
                !sameTunnel(observed.tunnel ?? undefined, desiredTunnel));
        if (dirty) {
            observed = yield* keylessCertificates.patchKeylessCertificate({
                zoneId,
                keylessCertificateId: observed.id,
                ...desired,
                enabled: news.enabled,
                tunnel: desiredTunnel,
            });
        }
        return toAttributes(observed, zoneId);
    }),
    delete: Effect.fn(function* ({ output }) {
        // Deleting an already-gone configuration answers with Cloudflare code
        // 1005 ("Invalid or missing Keyless SSL") — convergence, not failure.
        yield* keylessCertificates
            .deleteKeylessCertificate({
            zoneId: output.zoneId,
            keylessCertificateId: output.keylessCertificateId,
        })
            .pipe(Effect.catchTag("KeylessCertificateNotFound", () => Effect.void));
    }),
});
/**
 * Read a Keyless SSL configuration by id, mapping "gone"
 * (`KeylessCertificateNotFound`, Cloudflare error code 1005 "Invalid or
 * missing Keyless SSL") and the "deleted" tombstone status to `undefined`.
 */
const getKeylessCertificate = (zoneId, keylessCertificateId) => keylessCertificates
    .getKeylessCertificate({ zoneId, keylessCertificateId })
    .pipe(Effect.map((observed) => observed.status === "deleted" ? undefined : observed), Effect.catchTag("KeylessCertificateNotFound", () => Effect.succeed(undefined)));
/**
 * Find a non-deleted Keyless SSL configuration by exact name. Names are not
 * unique on Cloudflare's side; if several carry the same name, pick the
 * oldest for determinism.
 */
const findByName = (zoneId, name) => keylessCertificates.listKeylessCertificates.items({ zoneId }).pipe(Stream.filter((keyless) => keyless.name === name && keyless.status !== "deleted"), Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
    .sort((a, b) => a.createdOn.localeCompare(b.createdOn))
    .at(0)), Effect.map((keyless) => keyless && {
    ...keyless,
    permissions: [...keyless.permissions],
}));
const createKeylessName = (id, name) => Effect.gen(function* () {
    return name ?? (yield* createPhysicalName({ id, lowercase: true }));
});
/** Normalize PEM content for comparison (CRLF + trailing-newline noise). */
const normalizePem = (pem) => pem.replace(/\r\n/g, "\n").trim();
/**
 * Resolve a tunnel prop to the concrete shape the API expects. Inputs have
 * been resolved to concrete strings by Plan before reconcile runs.
 */
const resolveTunnel = (tunnel) => tunnel === undefined
    ? undefined
    : {
        privateIp: tunnel.privateIp,
        vnetId: tunnel.vnetId,
    };
const sameTunnel = (observed, desired) => observed !== undefined &&
    observed.privateIp === desired.privateIp &&
    observed.vnetId === desired.vnetId;
const toAttributes = (keyless, zoneId) => ({
    keylessCertificateId: keyless.id,
    zoneId,
    name: keyless.name,
    host: keyless.host,
    port: keyless.port,
    enabled: keyless.enabled,
    status: keyless.status,
    permissions: [...keyless.permissions],
    createdOn: keyless.createdOn,
    modifiedOn: keyless.modifiedOn,
    tunnel: keyless.tunnel ?? undefined,
});
//# sourceMappingURL=KeylessCertificate.js.map