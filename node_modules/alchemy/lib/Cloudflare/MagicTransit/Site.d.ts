import * as magicTransit from "@distilled.cloud/cloudflare/magic-transit";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.MagicTransit.Site";
type TypeId = typeof TypeId;
/**
 * Geographic location of a Magic WAN site.
 */
export interface MagicSiteLocation {
    /** Latitude of the site. */
    lat?: string;
    /** Longitude of the site. */
    lon?: string;
}
export interface MagicSiteProps {
    /**
     * The name of the site. If omitted, a unique name is generated from the
     * app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * An optional description of the site.
     */
    description?: string;
    /**
     * Magic WAN Connector identifier tag to associate with this site.
     */
    connectorId?: string;
    /**
     * Secondary Magic WAN Connector identifier tag. Used when high
     * availability mode is on.
     */
    secondaryConnectorId?: string;
    /**
     * Site high availability mode. If true, the site can have two connectors
     * and runs in high availability mode. Create-only — changing it triggers
     * a replacement.
     * @default false
     */
    haMode?: boolean;
    /**
     * Location of the site in latitude and longitude.
     */
    location?: MagicSiteLocation;
}
export interface MagicSiteAttributes {
    /** Cloudflare-assigned identifier of the site. */
    siteId: string;
    /** The Cloudflare account the site belongs to. */
    accountId: string;
    /** The name of the site. */
    name: string;
    /** The site description, if set. */
    description: string | undefined;
    /** The associated connector id, if set. */
    connectorId: string | undefined;
    /** The associated secondary connector id, if set. */
    secondaryConnectorId: string | undefined;
    /** Whether the site runs in high availability mode. */
    haMode: boolean | undefined;
    /** Location of the site, if set. */
    location: MagicSiteLocation | undefined;
}
export type MagicSite = Resource<TypeId, MagicSiteProps, MagicSiteAttributes, never, Providers>;
/**
 * A Magic WAN site — represents a physical or logical network location
 * (typically backed by a Magic WAN Connector appliance) under which LANs,
 * WANs, and ACLs are configured.
 *
 * Requires a Magic WAN subscription — accounts without it receive a typed
 * `MagicWanUnauthorized` error (Cloudflare code 1025).
 *
 * `haMode` is create-only — changing it triggers a replacement. Everything
 * else is updated in place.
 * ### Creating a site
 * **Example:** Basic site
 * ```typescript
 * const site = yield* Cloudflare.MagicTransit.MagicSite("hq", {
 *   description: "Headquarters",
 *   location: { lat: "37.7749", lon: "-122.4194" },
 * });
 * ```
 *
 * **Example:** Site with LAN and WAN
 * ```typescript
 * const site = yield* Cloudflare.MagicTransit.MagicSite("hq", {});
 *
 * const wan = yield* Cloudflare.MagicTransit.MagicSiteWan("hq-wan", {
 *   siteId: site.siteId,
 *   physport: 1,
 * });
 *
 * const lan = yield* Cloudflare.MagicTransit.MagicSiteLan("hq-lan", {
 *   siteId: site.siteId,
 *   physport: 2,
 *   vlanTag: 0,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/magic-wan/configuration/connector/
 *
 * @resource
 * @product Magic Transit
 * @category Network
 */
export declare const MagicSite: import("../../Resource.ts").ResourceClass<MagicSite>;
/**
 * Returns true if the given value is a MagicSite resource.
 */
export declare const isMagicSite: (value: unknown) => value is MagicSite;
export declare const MagicSiteProvider: () => import("effect/Layer").Layer<Provider.Provider<MagicSite>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | magicTransit.CloudflareOpContext>;
export {};
//# sourceMappingURL=Site.d.ts.map