import * as acm from "@distilled.cloud/cloudflare/acm";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Acm.TotalTls";
type TypeId = typeof TypeId;
/**
 * The Certificate Authority Total TLS certificates are issued through.
 */
export type TotalTlsCertificateAuthority = "google" | "lets_encrypt" | "ssl_com";
export interface TotalTlsProps {
    /**
     * Zone whose Total TLS setting is managed. Stable — changing the zone
     * triggers a replacement (the old zone's setting is restored to the
     * state it had before Alchemy managed it).
     */
    zoneId: string;
    /**
     * Whether Total TLS is enabled. When enabled, Cloudflare orders a
     * hostname-specific TLS certificate for every proxied A, AAAA, or CNAME
     * record in the zone. Mutable — updated in place.
     */
    enabled: boolean;
    /**
     * The Certificate Authority that Total TLS certificates will be issued
     * through. When omitted, Cloudflare picks one. Mutable — updated in
     * place.
     */
    certificateAuthority?: TotalTlsCertificateAuthority;
}
export interface TotalTlsAttributes {
    /** Zone the setting belongs to — this is the singleton's identity. */
    zoneId: string;
    /** Whether Total TLS is currently enabled on the zone. */
    enabled: boolean;
    /**
     * The Certificate Authority issuing Total TLS certificates, if
     * Cloudflare reports one.
     */
    certificateAuthority: string | undefined;
    /**
     * The validity period in days for certificates ordered via Total TLS
     * (currently always 90), if Cloudflare reports it.
     */
    validityPeriod: number | undefined;
    /**
     * Whether Total TLS was enabled before Alchemy first touched the zone.
     * Restored on destroy, so deleting the resource puts the zone back the
     * way it was found.
     */
    initialEnabled: boolean;
    /**
     * The Certificate Authority configured before Alchemy first touched the
     * zone, restored on destroy alongside `initialEnabled`.
     */
    initialCertificateAuthority: string | undefined;
}
export type TotalTls = Resource<TypeId, TotalTlsProps, TotalTlsAttributes, never, Providers>;
/**
 * The Total TLS setting of a Cloudflare zone
 * (`/zones/{zone_id}/acm/total_tls`).
 *
 * Total TLS orders a hostname-specific TLS certificate for every proxied
 * A, AAAA, or CNAME record in the zone, covering deep subdomains that the
 * universal certificate's single-level wildcard cannot. The setting is a
 * zone **singleton** — it always exists (default disabled), so this
 * resource never creates or deletes anything physical. Reconcile posts the
 * setting when the observed state differs from the desired one; destroy
 * restores the state the zone had before Alchemy first managed it
 * (captured as `initialEnabled` / `initialCertificateAuthority`).
 *
 * **Entitlement-gated**: configuring Total TLS requires the Advanced
 * Certificate Manager add-on on the zone. Without it, every write fails
 * with the typed `AdvancedCertificateManagerRequired` (code 1450) error
 * (reads succeed and report `enabled: false`).
 *
 * Only one `TotalTls` resource per zone makes sense — two instances
 * managing the same zone would fight over the singleton.
 * ### Managing Total TLS
 * **Example:** Enable Total TLS on a zone
 * ```typescript
 * const zone = yield* Cloudflare.Zone.Zone("Site", { name: "example.com" });
 *
 * yield* Cloudflare.Acm.TotalTls("TotalTls", {
 *   zoneId: zone.zoneId,
 *   enabled: true,
 * });
 * ```
 *
 * **Example:** Pin the issuing Certificate Authority
 * ```typescript
 * yield* Cloudflare.Acm.TotalTls("TotalTls", {
 *   zoneId: zone.zoneId,
 *   enabled: true,
 *   certificateAuthority: "lets_encrypt",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/ssl/edge-certificates/additional-options/total-tls/
 *
 * @resource
 * @product ACM
 * @category SSL/TLS & Certificates
 */
export declare const TotalTls: import("../../Resource.ts").ResourceClass<TotalTls>;
/**
 * Returns true if the given value is a TotalTls resource.
 */
export declare const isTotalTls: (value: unknown) => value is TotalTls;
export declare const TotalTlsProvider: () => import("effect/Layer").Layer<Provider.Provider<TotalTls>, never, CloudflareEnvironment | acm.CloudflareOpContext>;
export {};
//# sourceMappingURL=TotalTls.d.ts.map