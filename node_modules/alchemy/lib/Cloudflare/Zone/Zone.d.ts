import * as zones from "@distilled.cloud/cloudflare/zones";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
export type Type = "full" | "partial" | "secondary" | "internal";
export type Status = "initializing" | "pending" | "active" | "moved";
/** Metadata about the zone (Cloudflare `meta`). */
export type Meta = {
    /** @deprecated Always `false`. */
    cdnOnly: boolean | undefined;
    /** Number of allowed custom certificates. */
    customCertificateQuota: number | undefined;
    /** @deprecated Always `true`. */
    dnsOnly: boolean | undefined;
    /** Whether the zone is on Cloudflare's Foundation DNS plan. */
    foundationDns: boolean | undefined;
    /** Number of allowed Page Rules. */
    pageRuleQuota: number | undefined;
    /** Whether the zone has been flagged for phishing. */
    phishingDetected: boolean | undefined;
    /** Onboarding step the zone is currently on. */
    step: number | undefined;
};
/** The owner of the zone (Cloudflare `owner`). */
export type Owner = {
    /** Owner identifier. */
    id: string | undefined;
    /** Owner name. */
    name: string | undefined;
    /** Owner type (e.g. `user`, `organization`). */
    type: string | undefined;
};
/** An organizational unit (tenant) the zone belongs to. */
export type Tenant = {
    /** Tenant identifier. */
    id: string | undefined;
    /** Tenant name. */
    name: string | undefined;
};
/** The immediate parent organizational unit of the zone. */
export type TenantUnit = {
    /** Tenant unit identifier. */
    id: string | undefined;
};
/**
 * Common shape returned by a managed {@link Zone} resource — anything that
 * needs to point at a Cloudflare Zone can accept this.
 *
 * Mirrors Cloudflare's zone object. `zoneId` and `accountId` are Alchemy's
 * flattened identifiers (Cloudflare exposes these as `id` and `account.id`);
 * every other field keeps Cloudflare's own (camelCased) name.
 */
export type Attributes = {
    /** Zone identifier (Cloudflare `id`). Stable across updates. */
    zoneId: string;
    /** The fully-qualified domain name (e.g. `example.com`). */
    name: string;
    /** Identifier of the account the zone belongs to (Cloudflare `account.id`). */
    accountId: string;
    /** Name of the account the zone belongs to (Cloudflare `account.name`). */
    accountName: string | undefined;
    /**
     * Zone type. A full zone hosts its DNS at Cloudflare; a partial zone is a
     * partner/CNAME setup.
     */
    type: Type;
    /** The zone status on Cloudflare. */
    status: Status | undefined;
    /**
     * Whether the zone is DNS-only (Cloudflare's proxy/security features
     * disabled).
     */
    paused: boolean;
    /** The name servers Cloudflare assigns to the zone. */
    nameServers: string[];
    /** The original name servers before the domain moved to Cloudflare. */
    originalNameServers: string[] | undefined;
    /** Custom (vanity) name servers. Business/Enterprise plans only. */
    vanityNameServers: string[] | undefined;
    /** The last time proof of ownership was detected and the zone activated. */
    activatedOn: string | undefined;
    /** When the zone was created. */
    createdOn: string;
    /**
     * The interval (in seconds) until development mode expires (positive) or
     * since it last expired (negative). `0` if never enabled.
     */
    developmentMode: number;
    /** When the zone was last modified. */
    modifiedOn: string;
    /** The DNS host at the time of switching to Cloudflare. */
    originalDnshost: string | undefined;
    /** The registrar for the domain at the time of switching to Cloudflare. */
    originalRegistrar: string | undefined;
    /** Allows the customer to use a custom apex (tenants-only configuration). */
    cnameSuffix: string | undefined;
    /** Verification key for partial zone setup. */
    verificationKey: string | undefined;
    /** Metadata about the zone. */
    meta: Meta;
    /** The owner of the zone. */
    owner: Owner;
    /** The root organizational unit (tenant) the zone belongs to. */
    tenant: Tenant | undefined;
    /** The immediate parent organizational unit of the zone. */
    tenantUnit: TenantUnit | undefined;
};
export type Props = {
    /**
     * The fully-qualified zone name (e.g. `example.com`). Stable — changing it
     * triggers a replacement.
     */
    name: string;
    /**
     * Zone type. Full zones host their own DNS at Cloudflare; partial zones are
     * partner/CNAME setups.
     * @default "full"
     */
    type?: Type;
    /**
     * Pause Cloudflare's proxy on the zone (DNS-only).
     * @default false
     */
    paused?: boolean;
    /**
     * Custom (vanity) name servers. Business/Enterprise only.
     */
    vanityNameServers?: string[];
};
export type Zone = Resource<"Cloudflare.Zone.Zone", Props, Attributes, never, Providers>;
/**
 * A Cloudflare Zone (DNS domain) managed by Alchemy.
 *
 * Zones default to **retain** on removal — destroying the stack does NOT
 * delete the zone in Cloudflare. Opt in to actual deletion by wrapping the
 * resource (or the whole stack) in {@link destroy}() from
 * `alchemy/RemovalPolicy`.
 * ### Creating a Zone
 * **Example:** Create a new zone
 * ```typescript
 * const zone = yield* Cloudflare.Zone.Zone("MyZone", {
 *   name: "example.com",
 * });
 * ```
 *
 * **Example:** Allow destruction
 * ```typescript
 * import { destroy } from "alchemy/RemovalPolicy";
 * yield* Cloudflare.Zone.Zone("MyZone", { name: "example.com" }).pipe(destroy());
 * ```
 *
 * ### Adopting an existing Zone
 * **Example:** Take over a zone that already exists in Cloudflare
 * ```typescript
 * import { adopt } from "alchemy/AdoptPolicy";
 * // A zone carries no ownership markers, so the engine refuses to take over a
 * // pre-existing zone unless you opt in with `adopt(true)`.
 * const zone = yield* Cloudflare.Zone.Zone("MyZone", {
 *   name: "example.com",
 * }).pipe(adopt(true));
 * // zone.zoneId, zone.nameServers, zone.accountId, ...
 * ```
 *
 * @resource
 * @product Zones
 * @category Domains & DNS
 */
export declare const Zone: import("../../Resource.ts").ResourceClass<Zone>;
export declare const ZoneProvider: () => import("effect/Layer").Layer<Provider.Provider<Zone>, never, CloudflareEnvironment | zones.CloudflareOpContext>;
/** @internal — shape a distilled zones API result into `Attributes`. */
export declare const toZoneAttributes: (result: zones.GetZoneResponse, fallbackAccountId: string) => Attributes;
//# sourceMappingURL=Zone.d.ts.map