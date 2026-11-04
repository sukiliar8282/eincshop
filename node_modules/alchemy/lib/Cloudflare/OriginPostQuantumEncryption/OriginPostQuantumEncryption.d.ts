import * as pqe from "@distilled.cloud/cloudflare/origin-post-quantum-encryption";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.OriginPostQuantumEncryption.OriginPostQuantumEncryption";
type TypeId = typeof TypeId;
/**
 * Value of the Origin Post-Quantum Encryption setting.
 *
 * - `"preferred"` — advertise post-quantum key agreement to the origin and
 *   use it whenever the origin supports it.
 * - `"supported"` — accept post-quantum key agreement if the origin
 *   initiates it (Cloudflare's default).
 * - `"off"` — never use post-quantum key agreement to the origin.
 */
export type Value = "preferred" | "supported" | "off";
export type Props = {
    /**
     * Zone the Origin Post-Quantum Encryption setting belongs to. Stable —
     * changing the zone triggers a replacement (the old zone's setting is
     * restored to the value it had before Alchemy managed it).
     */
    zoneId: string;
    /**
     * Desired value of the setting. Mutable — updated in place.
     *
     * @default "supported"
     */
    value?: Value;
};
export type Attributes = {
    /** Zone the setting belongs to. */
    zoneId: string;
    /** Resolved current value of the setting. */
    value: Value;
    /**
     * Whether the setting can be modified on the zone's current plan.
     */
    editable: boolean;
    /** When the setting was last modified, if Cloudflare reports it. */
    modifiedOn: string | undefined;
    /**
     * The value the setting had before Alchemy first managed it. Restored
     * on destroy, so deleting the resource puts the zone back the way it
     * was found.
     */
    initialValue: Value;
};
export type OriginPostQuantumEncryption = Resource<TypeId, Props, Attributes, never, Providers>;
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
export declare const OriginPostQuantumEncryption: import("../../Resource.ts").ResourceClass<OriginPostQuantumEncryption>;
/**
 * Returns true if the given value is an OriginPostQuantumEncryption resource.
 */
export declare const isOriginPostQuantumEncryption: (value: unknown) => value is OriginPostQuantumEncryption;
export declare const OriginPostQuantumEncryptionProvider: () => import("effect/Layer").Layer<Provider.Provider<OriginPostQuantumEncryption>, never, CloudflareEnvironment | pqe.CloudflareOpContext>;
export {};
//# sourceMappingURL=OriginPostQuantumEncryption.d.ts.map