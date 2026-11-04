import { Services } from "@distilled.cloud/hetzner";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Providers } from "./Providers.ts";
export type ZoneMode = "primary" | "secondary";
export type ZoneStatus = "ok" | "updating" | "error";
export type ZoneRegistrar = "hetzner" | "other" | "unknown";
export type ZoneDelegationStatus = "valid" | "partially-valid" | "invalid" | "lame" | "unregistered" | "unknown" | (string & {});
export interface ZoneProps {
    /**
     * Apex domain of the zone (e.g. `example.com`). Must be lowercase, must
     * not end with a dot, and must use a well-known public suffix. Subdomains
     * are not supported. Changing this replaces the zone.
     *
     * If omitted, a unique `*.com` name is generated from the stack, stage,
     * and logical ID.
     */
    name?: string;
    /**
     * Zone mode. Primary zones are edited via the Cloud API (RRSets);
     * secondary zones are transferred from primary nameservers via AXFR.
     * Cannot be changed after creation — triggers a replacement.
     *
     * @default "primary"
     */
    mode?: ZoneMode;
    /**
     * Default TTL in seconds for RRSets that do not set their own TTL.
     * Must be between 60 and 2147483647. Omit to keep Hetzner's default on
     * create and leave the live value alone on update.
     */
    ttl?: number;
    /**
     * User-defined labels. Alchemy ownership labels (`alchemy.stack`,
     * `alchemy.stage`, `alchemy.id`) are always merged in.
     */
    labels?: Record<string, string>;
    /**
     * Prevent the zone from being deleted via the API.
     *
     * @default false
     */
    deleteProtection?: boolean;
}
export interface ZoneAttributes {
    /** Numeric Cloud API id of the zone. Stable across updates. */
    zoneId: number;
    /** Apex domain name. */
    name: string;
    /** Zone mode (`primary` or `secondary`). */
    mode: ZoneMode;
    /** Default TTL in seconds. */
    ttl: number;
    /** User-defined labels (Alchemy ownership labels stripped). */
    labels: Record<string, string>;
    /** Whether delete protection is enabled. */
    deleteProtection: boolean;
    /** Live zone status. */
    status: ZoneStatus;
    /** Number of resource records in the zone. */
    recordCount: number;
    /** Domain registrar as reported by Hetzner. */
    registrar: ZoneRegistrar;
    /** RFC3339 creation timestamp. */
    created: string;
    /** Authoritative Hetzner nameservers assigned to this zone. */
    assignedNameservers: string[];
    /** Nameservers currently delegated by the parent DNS zone. */
    delegatedNameservers: string[];
    /** Delegation check status, when Hetzner has reported one. */
    delegationStatus: ZoneDelegationStatus | undefined;
}
export type Zone = Resource<"Hetzner.Zone", ZoneProps, ZoneAttributes, never, Providers>;
/**
 * A Hetzner Cloud DNS zone — an apex domain hosted on Hetzner's
 * authoritative nameservers.
 *
 * The zone `name` is the identity: changing it replaces the zone. Default
 * TTL, labels, and delete protection update in place. Resource record sets
 * are a separate resource (`RecordSet`).
 * @see https://docs.hetzner.cloud/reference/cloud#zones
 *
 * ### Creating a Zone
 * **Example:** Primary zone with a default TTL
 * ```typescript
 * const zone = yield* Hetzner.Zone("example", {
 *   name: "example.com",
 *   ttl: 3600,
 * });
 * ```
 *
 * **Example:** Zone with labels and delete protection
 * ```typescript
 * const zone = yield* Hetzner.Zone("example", {
 *   name: "example.com",
 *   labels: { env: "prod" },
 *   deleteProtection: true,
 * });
 * ```
 *
 * @resource
 */
export declare const Zone: import("../Resource.ts").ResourceClass<Zone>;
export declare const ZoneProvider: () => import("effect/Layer").Layer<Provider.Provider<Zone>, never, import("../Stack.ts").Stack | import("../Stage.ts").Stage | Services.actions.HetznerOpContext>;
//# sourceMappingURL=Zone.d.ts.map