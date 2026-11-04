import * as dns from "@distilled.cloud/cloudflare/dns";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.DNS.Dnssec";
type TypeId = typeof TypeId;
/**
 * Live DNSSEC status as Cloudflare reports it. `pending` /
 * `pending-disabled` are the eventually-consistent transitions toward
 * `active` / `disabled`; reaching `active` additionally requires the DS
 * record to be submitted at the registrar.
 */
export type DnssecStatus = "active" | "pending" | "disabled" | "pending-disabled" | "error" | (string & {});
/**
 * The user-desired DNSSEC state — Cloudflare's PATCH endpoint only
 * accepts these two values.
 */
export type DnssecDesiredStatus = "active" | "disabled";
export interface DnssecProps {
    /**
     * Zone whose DNSSEC configuration is managed. Stable — DNSSEC is a
     * per-zone singleton, so changing the zone triggers a replacement
     * (the old zone's DNSSEC is restored to its pre-management state).
     */
    zoneId: string;
    /**
     * Desired DNSSEC state. `"active"` signs the zone; `"disabled"` turns
     * signing off. Activation is eventually consistent — Cloudflare
     * reports `pending` until the registrar-side DS record is in place.
     *
     * Mutable — patched in place.
     *
     * @default "active"
     */
    status?: DnssecDesiredStatus;
    /**
     * Enable multi-signer DNSSEC, allowing multiple providers to serve a
     * DNSSEC-signed zone at the same time (required for user-managed
     * DNSKEY records).
     *
     * Mutable — patched in place.
     *
     * @default false
     */
    dnssecMultiSigner?: boolean;
    /**
     * Allow Cloudflare to transfer in a pre-signed zone (signatures
     * included) from an external provider without signing on the fly.
     *
     * Mutable — patched in place.
     *
     * @default false
     */
    dnssecPresigned?: boolean;
    /**
     * Use NSEC3 together with DNSSEC. Combined with `dnssecPresigned`,
     * enables NSEC3 records when transferring in from an external
     * provider (live signing with NSEC3 requires Foundation DNS).
     *
     * Mutable — patched in place.
     *
     * @default false
     */
    dnssecUseNsec3?: boolean;
}
export interface DnssecAttributes {
    /** Zone whose DNSSEC configuration is managed. */
    zoneId: string;
    /**
     * Live DNSSEC status. Stays `pending` until the DS record is
     * submitted at the registrar — that final hop is outside Cloudflare's
     * (and Alchemy's) control.
     */
    status: DnssecStatus;
    /** Whether multi-signer DNSSEC is enabled. */
    dnssecMultiSigner: boolean | undefined;
    /** Whether pre-signed zone transfers are enabled. */
    dnssecPresigned: boolean | undefined;
    /** Whether NSEC3 is enabled. */
    dnssecUseNsec3: boolean | undefined;
    /** DNSSEC algorithm key code (e.g. `"13"`). */
    algorithm: string | undefined;
    /** Digest hash for the DS record. */
    digest: string | undefined;
    /** Digest algorithm name (e.g. `"SHA256"`). */
    digestAlgorithm: string | undefined;
    /** Coded digest algorithm type (e.g. `"2"`). */
    digestType: string | undefined;
    /**
     * Full DS record string — this is what users paste at their registrar
     * to complete DNSSEC activation.
     */
    ds: string | undefined;
    /** DNSKEY flags field (e.g. `257` for KSK). */
    flags: number | undefined;
    /** DS key tag. */
    keyTag: number | undefined;
    /** Algorithm key type (e.g. `"ECDSAP256SHA256"`). */
    keyType: string | undefined;
    /** Public key for the DS record. */
    publicKey: string | undefined;
    /** When DNSSEC was last modified. */
    modifiedOn: string | undefined;
    /**
     * The desired-state family DNSSEC was in before Alchemy first managed
     * it (`pending` normalises to `active`, `pending-disabled` to
     * `disabled`). Restored on destroy.
     */
    initialStatus: DnssecDesiredStatus;
    /** `dnssecMultiSigner` before Alchemy first managed the zone. */
    initialMultiSigner: boolean | undefined;
    /** `dnssecPresigned` before Alchemy first managed the zone. */
    initialPresigned: boolean | undefined;
    /** `dnssecUseNsec3` before Alchemy first managed the zone. */
    initialUseNsec3: boolean | undefined;
}
export type Dnssec = Resource<TypeId, DnssecProps, DnssecAttributes, never, Providers>;
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
export declare const Dnssec: import("../../Resource.ts").ResourceClass<Dnssec>;
/**
 * Returns true if the given value is a Dnssec resource.
 */
export declare const issec: (value: unknown) => value is Dnssec;
export declare const DnssecProvider: () => import("effect/Layer").Layer<Provider.Provider<Dnssec>, never, CloudflareEnvironment | dns.CloudflareOpContext>;
export {};
//# sourceMappingURL=Dnssec.d.ts.map