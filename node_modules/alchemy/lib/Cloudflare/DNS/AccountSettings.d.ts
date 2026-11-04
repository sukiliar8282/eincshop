import * as dns from "@distilled.cloud/cloudflare/dns";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.DNS.AccountSettings";
type TypeId = typeof TypeId;
/**
 * Default nameserver assignment for new zones in the account.
 */
export interface AccountDnsNameservers {
    /**
     * Nameserver kind: Cloudflare's standard pair, a random standard
     * assignment, or custom nameservers defined at the account or tenant
     * level.
     */
    type: "cloudflare.standard" | "cloudflare.standard.random" | "custom.account" | "custom.tenant" | (string & {});
}
/**
 * Components of the default SOA record for new zones. Every field is
 * optional — omitted fields keep their current value.
 */
export interface AccountDnsSoa {
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
/**
 * Default DNS settings applied to new zones in the account. Only the
 * fields you provide are compared and patched.
 */
export interface AccountDnsZoneDefaults {
    /**
     * Flatten all CNAME records by default.
     * @default false
     */
    flattenAllCnames?: boolean;
    /**
     * Enable Foundation DNS Advanced Nameservers by default (paid
     * add-on).
     * @default false
     */
    foundationDns?: boolean;
    /**
     * Default settings for internal zones (Enterprise Internal DNS only).
     */
    internalDns?: {
        /** Zone to resolve from when an internal zone has no match. */
        referenceZoneId?: string;
    };
    /**
     * Enable multi-provider DNS by default.
     * @default false
     */
    multiProvider?: boolean;
    /**
     * Default nameserver assignment for new zones.
     * @default { type: "cloudflare.standard" }
     */
    nameservers?: AccountDnsNameservers;
    /**
     * Default TTL (seconds) of zones' NS records.
     * @default 86400
     */
    nsTtl?: number;
    /**
     * Allow secondary zones to use proxied override records and CNAME
     * flattening at the apex by default.
     * @default false
     */
    secondaryOverrides?: boolean;
    /**
     * Components of the default SOA record for new zones.
     */
    soa?: AccountDnsSoa;
    /**
     * Default zone mode for new zones.
     * @default "standard"
     */
    zoneMode?: "standard" | "cdn_only" | "dns_only";
}
export interface AccountDnsSettingsProps {
    /**
     * Force all proxied DNS records in the account to behave as DNS-only
     * at the edge, regardless of each record's individual proxy setting.
     *
     * Mutable — patched in place.
     * @default false
     */
    enforceDnsOnly?: boolean;
    /**
     * Default DNS settings applied to new zones created in the account.
     * Only the fields you declare are compared and patched; the rest keep
     * their live values.
     *
     * Mutable — patched in place.
     */
    zoneDefaults?: AccountDnsZoneDefaults;
}
/**
 * Fully-resolved snapshot of the account's DNS settings as Cloudflare
 * reports them (`GET /accounts/{account_id}/dns_settings`).
 */
export interface AccountDnsSettingsSnapshot {
    /** Whether proxied records are forced to DNS-only. */
    enforceDnsOnly: boolean;
    /** Resolved zone defaults. */
    zoneDefaults: {
        /** Whether all CNAMEs are flattened by default. */
        flattenAllCnames: boolean;
        /** Whether Foundation DNS is enabled by default. */
        foundationDns: boolean;
        /** Default internal DNS reference zone, if configured. */
        internalDns: {
            referenceZoneId: string | undefined;
        };
        /** Whether multi-provider DNS is enabled by default. */
        multiProvider: boolean;
        /** Default nameserver assignment. */
        nameservers: {
            type: string;
        };
        /** Default TTL of zones' NS records. */
        nsTtl: number;
        /** Whether secondary overrides are enabled by default. */
        secondaryOverrides: boolean;
        /** Resolved default SOA components. */
        soa: {
            expire: number | undefined;
            minTtl: number | undefined;
            mname: string | undefined;
            refresh: number | undefined;
            retry: number | undefined;
            rname: string | undefined;
            ttl: number | undefined;
        };
        /** Default zone mode. */
        zoneMode: string;
    };
}
export interface AccountDnsSettingsAttributes extends AccountDnsSettingsSnapshot {
    /** The Cloudflare account whose DNS settings are managed. */
    accountId: string;
    /**
     * Snapshot of every DNS setting taken before Alchemy first patched
     * the account. The managed fields are restored from it on destroy, so
     * deleting the resource puts the account back the way it was found.
     */
    initialSettings: AccountDnsSettingsSnapshot;
    /**
     * Which settings this resource has managed (union across all
     * reconciles). Only these are restored on destroy — settings the user
     * never touched are left alone.
     */
    managedKeys: ReadonlyArray<string>;
}
export type AccountDnsSettings = Resource<TypeId, AccountDnsSettingsProps, AccountDnsSettingsAttributes, never, Providers>;
/**
 * The DNS settings of a Cloudflare account
 * (`/accounts/{account_id}/dns_settings`) — the account-wide
 * `enforceDnsOnly` override and the default DNS settings applied to
 * every new zone (`zoneDefaults`).
 *
 * The settings object is a per-account singleton — it always exists
 * with Cloudflare defaults, so this resource never creates or deletes
 * anything physical. Reconcile patches only the fields you declare
 * (and only when the observed value differs); destroy restores the
 * managed fields to the values they had before Alchemy first touched
 * the account (captured as `initialSettings`).
 *
 * Some fields are plan-gated: `zoneDefaults.nsTtl` and custom SOA
 * values require the custom nameserver TTL / custom SOA entitlements,
 * `foundationDns` is a paid add-on, and `internalDns` is Enterprise
 * Internal DNS only.
 * ### Account-wide overrides
 * **Example:** Force every proxied record to DNS-only
 * ```typescript
 * yield* Cloudflare.DNS.AccountDnsSettings("DnsSettings", {
 *   enforceDnsOnly: true,
 * });
 * ```
 *
 * ### Zone defaults
 * **Example:** Flatten CNAMEs in every new zone
 * ```typescript
 * yield* Cloudflare.DNS.AccountDnsSettings("DnsSettings", {
 *   zoneDefaults: { flattenAllCnames: true },
 * });
 * ```
 *
 * **Example:** Default new zones to multi-provider DNS
 * ```typescript
 * yield* Cloudflare.DNS.AccountDnsSettings("DnsSettings", {
 *   zoneDefaults: { multiProvider: true },
 * });
 * ```
 *
 * @resource
 * @product DNS
 * @category Domains & DNS
 */
export declare const AccountDnsSettings: import("../../Resource.ts").ResourceClass<AccountDnsSettings>;
/**
 * Returns true if the given value is an AccountDnsSettings resource.
 */
export declare const isAccountDnsSettings: (value: unknown) => value is AccountDnsSettings;
export declare const AccountDnsSettingsProvider: () => import("effect/Layer").Layer<Provider.Provider<AccountDnsSettings>, never, CloudflareEnvironment | dns.CloudflareOpContext>;
export {};
//# sourceMappingURL=AccountSettings.d.ts.map