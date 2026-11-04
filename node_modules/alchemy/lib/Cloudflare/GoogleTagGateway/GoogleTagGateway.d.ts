import * as googleTagGateway from "@distilled.cloud/cloudflare/google-tag-gateway";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
import { type Reference } from "../Zone/index.ts";
declare const TypeId: "Cloudflare.GoogleTagGateway.GoogleTagGateway";
type TypeId = typeof TypeId;
/**
 * The plain Google Tag Gateway configuration shape — the value PUT to and
 * read back from `/zones/{zone_id}/settings/google-tag-gateway/config`.
 */
export type Config = {
    /** Whether Google Tag Gateway is enabled for the zone. */
    enabled: boolean;
    /** Endpoint path used to proxy Google Tag Manager requests. */
    endpoint: string;
    /** Whether the original client IP address is hidden from Google. */
    hideOriginalIp: boolean;
    /** Google Tag Manager container or measurement ID. */
    measurementId: string;
    /** Whether the associated Google tag is set up on the zone automatically. */
    setUpTag: boolean | undefined;
};
export type Props = {
    /**
     * Zone whose Google Tag Gateway config should be managed. Accepts a zone
     * id, a zone name (`example.com`), or a `{ zoneId, name? }` object.
     *
     * Stable — the config belongs to the zone, so changing the zone triggers
     * a replacement (the old zone's config is restored to the value it had
     * before Alchemy managed it).
     */
    zone: Reference;
    /**
     * Enables or disables Google Tag Gateway for the zone.
     */
    enabled: boolean;
    /**
     * Endpoint path for proxying Google Tag Manager requests. Must be an
     * absolute path starting with `/`, with no nested paths and alphanumeric
     * characters only (e.g. `/metrics`).
     */
    endpoint: string;
    /**
     * Google Tag Manager container or measurement ID
     * (e.g. `GTM-XXXXXXX` or `G-XXXXXXXXXX`).
     */
    measurementId: string;
    /**
     * Hides the original client IP address from Google when enabled.
     */
    hideOriginalIp: boolean;
    /**
     * Set up the associated Google tag on the zone automatically when
     * enabled. When omitted, the zone's current value is retained
     * (Cloudflare's own default is `true`).
     *
     * @default retain the zone's current value
     */
    setUpTag?: boolean;
};
export type Attributes = Config & {
    /** Cloudflare zone id the config belongs to. */
    zoneId: string;
    /**
     * The configuration the zone had before Alchemy first managed it
     * (`undefined` when the zone had never configured Google Tag Gateway).
     * Restored on destroy, so deleting the resource puts the zone back the
     * way it was found.
     */
    initialConfig: Config | undefined;
};
export type GoogleTagGateway = Resource<TypeId, Props, Attributes, never, Providers>;
/**
 * Google Tag Gateway configuration for a Cloudflare zone
 * (`/zones/{zone_id}/settings/google-tag-gateway/config`).
 *
 * Google Tag Gateway serves Google Tag Manager / gtag.js first-party through
 * the zone — requests to the configured endpoint path are proxied to Google
 * by Cloudflare's edge. The config is a zone-level singleton: there is one
 * per zone and the PUT API is a full replace, so reconcile is a single
 * idempotent upsert. Destroy restores the configuration the zone had before
 * Alchemy first managed it (or disables the gateway when the zone had never
 * configured it).
 * ### Managing the gateway
 * **Example:** Enable Google Tag Gateway on a zone
 * ```typescript
 * const gateway = yield* Cloudflare.GoogleTagGateway.GoogleTagGateway("Analytics", {
 *   zone: "example.com",
 *   enabled: true,
 *   endpoint: "/metrics",
 *   measurementId: "G-XXXXXXXXXX",
 *   hideOriginalIp: true,
 * });
 * ```
 *
 * **Example:** Proxy a Google Tag Manager container without auto-installing the tag
 * ```typescript
 * const gateway = yield* Cloudflare.GoogleTagGateway.GoogleTagGateway("Gtm", {
 *   zone: zone.zoneId,
 *   enabled: true,
 *   endpoint: "/collect",
 *   measurementId: "GTM-XXXXXXX",
 *   hideOriginalIp: false,
 *   setUpTag: false,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/google-tag-gateway/
 *
 * @resource
 * @product Google Tag Gateway
 * @category Performance & Reliability
 */
export declare const GoogleTagGateway: import("../../Resource.ts").ResourceClass<GoogleTagGateway>;
/**
 * Returns true if the given value is a GoogleTagGateway resource.
 */
export declare const isGoogleTagGateway: (value: unknown) => value is GoogleTagGateway;
export declare const GoogleTagGatewayProvider: () => import("effect/Layer").Layer<Provider.Provider<GoogleTagGateway>, never, CloudflareEnvironment | googleTagGateway.CloudflareOpContext>;
export {};
//# sourceMappingURL=GoogleTagGateway.d.ts.map