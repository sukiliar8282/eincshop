import * as pqe from "@distilled.cloud/cloudflare/origin-post-quantum-encryption";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { listAllZones } from "../Zone/lookup.js";
const TypeId = "Cloudflare.OriginPostQuantumEncryption.OriginPostQuantumEncryption";
/**
 * Origin Post-Quantum Encryption for a Cloudflare zone
 * (`/zones/{zone_id}/cache/origin_post_quantum_encryption`).
 *
 * Controls whether Cloudflare uses post-quantum (PQ) key agreement on the
 * TLS connections it makes to your origin. Despite living under the
 * `/cache/` API path, this is an SSL/origin-connection setting, not a
 * caching one.
 *
 * The setting is a singleton — it always exists on every zone with a
 * Cloudflare default of `"supported"`, so this resource never creates or
 * deletes anything physical. Reconcile updates the setting when the
 * observed value differs from the desired one; destroy restores the value
 * the setting had before Alchemy first managed it (captured as
 * `initialValue`).
 * ### Managing the setting
 * **Example:** Prefer post-quantum key agreement to the origin
 * ```typescript
 * const zone = yield* Cloudflare.Zone.Zone("Site", { name: "example.com" });
 *
 * yield* Cloudflare.OriginPostQuantumEncryption.OriginPostQuantumEncryption("OriginPqe", {
 *   zoneId: zone.zoneId,
 *   value: "preferred",
 * });
 * ```
 *
 * **Example:** Disable post-quantum key agreement to the origin
 * ```typescript
 * yield* Cloudflare.OriginPostQuantumEncryption.OriginPostQuantumEncryption("OriginPqe", {
 *   zoneId: zone.zoneId,
 *   value: "off",
 * });
 * ```
 *
 * **Example:** Pin the Cloudflare default explicitly
 * ```typescript
 * yield* Cloudflare.OriginPostQuantumEncryption.OriginPostQuantumEncryption("OriginPqe", {
 *   zoneId: zone.zoneId,
 *   value: "supported",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/ssl/origin-configuration/pqc-to-origin/
 *
 * @resource
 * @product Origin Post-Quantum Encryption
 * @category SSL/TLS & Certificates
 */
export const OriginPostQuantumEncryption = Resource(TypeId, {
    aliases: ["Cloudflare.OriginPostQuantumEncryption"],
});
/**
 * Returns true if the given value is an OriginPostQuantumEncryption resource.
 */
export const isOriginPostQuantumEncryption = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const OriginPostQuantumEncryptionProvider = () => Provider.succeed(OriginPostQuantumEncryption, {
    nuke: { singleton: true },
    stables: ["zoneId", "initialValue"],
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // No account-wide API for this zone singleton — enumerate every
        // zone in the account and read its setting (every zone has one).
        const allZones = yield* listAllZones(accountId);
        const rows = yield* Effect.forEach(allZones.map((zone) => zone.id), (zoneId) => pqe.getOriginPostQuantumEncryption({ zoneId }).pipe(Effect.map((observed) => toAttributes(zoneId, observed, toValue(observed.value))), 
        // Zone gone out-of-band / not resolvable — skip it. (Transient
        // 403/429 "Authentication error" blips under concurrency are
        // retried globally by the Cloudflare retry policy, so they never
        // reach here as a real failure.)
        Effect.catchTag("InvalidZoneIdentifier", () => Effect.succeed(undefined))), { concurrency: 10 });
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
        const observed = yield* pqe
            .getOriginPostQuantumEncryption({ zoneId })
            .pipe(
        // Zone deleted out-of-band — the setting is gone with it.
        Effect.catchTag("InvalidZoneIdentifier", () => Effect.succeed(undefined)));
        if (observed === undefined)
            return undefined;
        // The setting is a singleton that always exists with a Cloudflare
        // default — there is nothing to "own", so a cold read adopts freely
        // (never `Unowned`). The observed value at adoption time becomes the
        // `initialValue` restored on destroy.
        const initialValue = output !== undefined ? output.initialValue : toValue(observed.value);
        return toAttributes(zoneId, observed, initialValue);
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        // Inputs have been resolved to concrete strings by Plan.
        const zoneId = news.zoneId;
        const desired = news.value ?? "supported";
        // 1. Observe — the setting always exists; read its live value.
        const observed = yield* pqe.getOriginPostQuantumEncryption({ zoneId });
        // 2. Capture — the pre-management value, restored on destroy.
        //    `output` (including an adoption read) already carries it;
        //    otherwise this is our first touch and the observed value is
        //    the zone's original.
        const initialValue = output !== undefined ? output.initialValue : toValue(observed.value);
        // 3. Sync — update only when the observed value differs.
        if (toValue(observed.value) === desired) {
            return toAttributes(zoneId, observed, initialValue);
        }
        const updated = yield* pqe.putOriginPostQuantumEncryption({
            zoneId,
            value: desired,
        });
        return toAttributes(zoneId, updated, initialValue);
    }),
    delete: Effect.fn(function* ({ output }) {
        const { zoneId, initialValue } = output;
        // Observe — if the zone itself is gone, so is the setting.
        const observed = yield* pqe
            .getOriginPostQuantumEncryption({ zoneId })
            .pipe(Effect.catchTag("InvalidZoneIdentifier", () => Effect.succeed(undefined)));
        if (observed === undefined)
            return;
        // Restore the pre-management value; skip the call when it already
        // matches (idempotent re-delete after a crashed run).
        if (toValue(observed.value) === initialValue)
            return;
        yield* pqe
            .putOriginPostQuantumEncryption({ zoneId, value: initialValue })
            .pipe(Effect.catchTag("InvalidZoneIdentifier", () => Effect.void));
    }),
});
/**
 * Narrow the distilled response's open
 * `"preferred" | "supported" | "off" | (string & {})` value to the closed
 * triple — Cloudflare only ever returns the three literals for this
 * setting; anything else collapses to the documented default.
 */
const toValue = (value) => value === "preferred" || value === "off" ? value : "supported";
const toAttributes = (zoneId, setting, initialValue) => ({
    zoneId,
    value: toValue(setting.value),
    editable: setting.editable,
    modifiedOn: setting.modifiedOn ?? undefined,
    initialValue,
});
//# sourceMappingURL=OriginPostQuantumEncryption.js.map