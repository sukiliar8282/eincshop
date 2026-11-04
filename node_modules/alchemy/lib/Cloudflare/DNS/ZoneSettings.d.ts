import * as dns from "@distilled.cloud/cloudflare/dns";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.DNS.ZoneSettings";
type TypeId = typeof TypeId;
/**
 * Nameserver assignment for the zone. `custom.*` types require
 * Business/Enterprise account-level custom nameservers (ACNS).
 */
export interface ZoneDnsNameservers {
    /**
     * Nameserver kind: Cloudflare's standard pair, or custom nameservers
     * defined at the account, tenant, or zone level.
     */
    type: "cloudflare.standard" | "custom.account" | "custom.tenant" | "custom.zone" | (string & {});
    /**
     * Which configured nameserver set to use (for `custom.account` /
     * `custom.tenant`).
     */
    nsSet?: number;
}
/**
 * Components of the zone's SOA record. Every field is optional —
 * omitted fields keep their current value.
 */
export interface ZoneDnsSoa {
    /** Time in seconds after which secondaries stop answering (`expire`). */
    expire?: number;
    /** Negative-caching TTL in seconds (`minimum`). */
    minTtl?: number;
    /** Primary nameserver (`MNAME`). */
    mname?: string;
    /** Secondary refresh interval in seconds. */
    refresh?: number;
    /** Secondary retry interval in seconds. */
    retry?: number;
    /** Zone administrator mailbox (`RNAME`). */
    rname?: string;
    /** TTL of the SOA record itself. */
    ttl?: number;
}
export interface ZoneDnsSettingsProps {
    /**
     * Zone whose DNS settings are managed. Stable — the settings object
     * is a per-zone singleton, so changing the zone triggers a
     * replacement (the old zone's managed settings are restored to their
     * pre-management values).
     */
    zoneId: string;
    /**
     * Flatten all CNAME records in the zone (a CNAME at the zone apex is
     * always flattened regardless).
     *
     * Mutable — patched in place.
     *
     * @default false
     */
    flattenAllCnames?: boolean;
    /**
     * Enable Foundation DNS Advanced Nameservers (paid add-on — patching
     * `true` fails without the entitlement).
     *
     * Mutable — patched in place.
     *
     * @default false
     */
    foundationDns?: boolean;
    /**
     * Settings for internal zones (Enterprise Internal DNS only).
     *
     * Mutable — patched in place.
     */
    internalDns?: {
        /** Zone to resolve from when this internal zone has no match. */
        referenceZoneId?: string;
    };
    /**
     * Enable multi-provider DNS — activates the zone even when
     * non-Cloudflare NS records exist and respects apex NS records during
     * outbound zone transfers.
     *
     * Mutable — patched in place.
     *
     * @default false
     */
    multiProvider?: boolean;
    /**
     * Nameservers through which the zone should be available.
     *
     * Mutable — patched in place.
     *
     * @default { type: "cloudflare.standard" }
     */
    nameservers?: ZoneDnsNameservers;
    /**
     * TTL (seconds) of the zone's NS records.
     *
     * Mutable — patched in place.
     *
     * @default 86400
     */
    nsTtl?: number;
    /**
     * Allow a secondary zone to use proxied override records and CNAME
     * flattening at the apex (secondary zones only).
     *
     * Mutable — patched in place.
     *
     * @default false
     */
    secondaryOverrides?: boolean;
    /**
     * Components of the zone's SOA record. Only the fields you provide
     * are compared and patched; the rest keep their live values.
     *
     * Mutable — patched in place.
     */
    soa?: ZoneDnsSoa;
    /**
     * Whether the zone is a regular, CDN-only, or DNS-only zone.
     *
     * Mutable — patched in place.
     *
     * @default "standard"
     */
    zoneMode?: "standard" | "cdn_only" | "dns_only";
}
/**
 * Fully-resolved snapshot of a zone's DNS settings as Cloudflare
 * reports them (`GET /zones/{zone_id}/dns_settings`).
 */
export interface ZoneDnsSettingsSnapshot {
    /** Whether all CNAMEs are flattened. */
    flattenAllCnames: boolean;
    /** Whether Foundation DNS is enabled. */
    foundationDns: boolean;
    /** Internal DNS reference zone, if configured. */
    internalDns: {
        referenceZoneId: string | undefined;
    };
    /** Whether multi-provider DNS is enabled. */
    multiProvider: boolean;
    /** Resolved nameserver assignment. */
    nameservers: {
        type: string;
        nsSet: number | undefined;
    };
    /** TTL of the zone's NS records. */
    nsTtl: number;
    /** Whether secondary overrides are enabled. */
    secondaryOverrides: boolean;
    /** Resolved SOA components. */
    soa: {
        expire: number | undefined;
        minTtl: number | undefined;
        mname: string | undefined;
        refresh: number | undefined;
        retry: number | undefined;
        rname: string | undefined;
        ttl: number | undefined;
    };
    /** Zone mode. */
    zoneMode: string;
}
export interface ZoneDnsSettingsAttributes extends ZoneDnsSettingsSnapshot {
    /** Zone whose DNS settings are managed. */
    zoneId: string;
    /**
     * Snapshot of every DNS setting taken before Alchemy first patched
     * the zone. The managed fields are restored from it on destroy, so
     * deleting the resource puts the zone back the way it was found.
     */
    initialSettings: ZoneDnsSettingsSnapshot;
    /**
     * Which top-level settings this resource has managed (union across
     * all reconciles). Only these are restored on destroy — settings the
     * user never touched are left alone.
     */
    managedKeys: ReadonlyArray<string>;
}
export type ZoneDnsSettings = Resource<TypeId, ZoneDnsSettingsProps, ZoneDnsSettingsAttributes, never, Providers>;
/**
 * The DNS settings of a Cloudflare zone
 * (`/zones/{zone_id}/dns_settings`) — nameserver assignment, NS TTL,
 * SOA components, CNAME flattening, multi-provider mode, and zone mode.
 *
 * The settings object is a per-zone singleton — it always exists with
 * Cloudflare defaults, so this resource never creates or deletes
 * anything physical. Reconcile patches only the fields you declare
 * (and only when the observed value differs); destroy restores the
 * managed fields to the values they had before Alchemy first touched
 * the zone (captured as `initialSettings`).
 *
 * Some fields are plan-gated: `foundationDns` is a paid add-on,
 * `nameservers.type: "custom.*"` requires account custom nameservers,
 * `internalDns` and `secondaryOverrides` are Enterprise features.
 * ### Basic settings
 * **Example:** Lower the NS record TTL
 * ```typescript
 * yield* Cloudflare.DNS.ZoneDnsSettings("DnsSettings", {
 *   zoneId: zone.zoneId,
 *   nsTtl: 3600,
 * });
 * ```
 *
 * **Example:** Flatten every CNAME in the zone
 * ```typescript
 * yield* Cloudflare.DNS.ZoneDnsSettings("DnsSettings", {
 *   zoneId: zone.zoneId,
 *   flattenAllCnames: true,
 * });
 * ```
 *
 * ### SOA tuning
 * **Example:** Shorten the negative-caching TTL
 * ```typescript
 * yield* Cloudflare.DNS.ZoneDnsSettings("DnsSettings", {
 *   zoneId: zone.zoneId,
 *   soa: { minTtl: 300 },
 * });
 * ```
 *
 * ### Multi-provider DNS
 * **Example:** Serve the zone alongside another DNS provider
 * ```typescript
 * yield* Cloudflare.DNS.ZoneDnsSettings("DnsSettings", {
 *   zoneId: zone.zoneId,
 *   multiProvider: true,
 * });
 * ```
 *
 * @resource
 * @product DNS
 * @category Domains & DNS
 */
export declare const ZoneDnsSettings: import("../../Resource.ts").ResourceClass<ZoneDnsSettings>;
/**
 * Returns true if the given value is a ZoneDnsSettings resource.
 */
export declare const isZoneDnsSettings: (value: unknown) => value is ZoneDnsSettings;
export declare const ZoneDnsSettingsProvider: () => import("effect/Layer").Layer<Provider.Provider<ZoneDnsSettings>, never, CloudflareEnvironment | dns.CloudflareOpContext>;
export {};
//# sourceMappingURL=ZoneSettings.d.ts.map