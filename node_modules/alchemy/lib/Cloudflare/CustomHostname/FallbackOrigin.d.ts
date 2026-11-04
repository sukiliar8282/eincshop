import * as customHostnames from "@distilled.cloud/cloudflare/custom-hostnames";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
export interface FallbackOriginProps {
    /**
     * Zone the fallback origin belongs to. Stable — a zone has exactly one
     * fallback origin, so changing the zone triggers replacement.
     */
    zoneId: string;
    /**
     * Your origin hostname that requests to custom hostnames are sent to.
     * Must be a DNS record (A, AAAA or CNAME) within the zone — create the
     * `Cloudflare.DNS.Record` first and pass its name.
     *
     * Mutable — the API is a PUT-style upsert.
     */
    origin: string;
}
export interface FallbackOriginAttributes {
    /** Zone that owns this fallback origin. */
    zoneId: string;
    /** The configured origin hostname. */
    origin: string;
    /**
     * Activation status (`initializing`, `pending_deployment`, `active`,
     * …). Deployment is asynchronous (typically minutes) and is not
     * blocked on.
     */
    status: string | undefined;
}
export type FallbackOrigin = Resource<"Cloudflare.CustomHostname.FallbackOrigin", FallbackOriginProps, FallbackOriginAttributes, never, Providers>;
/**
 * The Cloudflare for SaaS fallback origin of a zone.
 *
 * A zone-level singleton: requests to any of the zone's custom hostnames
 * that don't have a `customOriginServer` are routed to this origin.
 * Setting a fallback origin implicitly enables Cloudflare for SaaS on
 * the zone.
 *
 * Safety: when there is no prior state, `read` reports an existing
 * fallback origin as `Unowned`, so the engine refuses to overwrite an
 * out-of-band configuration unless `--adopt` (or `adopt(true)`) is set.
 * ### Setting the Fallback Origin
 * **Example:** Point custom hostname traffic at your origin
 * ```typescript
 * const record = yield* Cloudflare.DNS.Record("Origin", {
 *   zoneId: zone.zoneId,
 *   name: "origin.my-saas.com",
 *   type: "A",
 *   content: "203.0.113.1",
 *   proxied: true,
 * });
 * const fallback = yield* Cloudflare.CustomHostname.FallbackOrigin("Fallback", {
 *   zoneId: zone.zoneId,
 *   origin: record.name,
 * });
 * ```
 *
 * @resource
 * @product Custom Hostnames
 * @category Domains & DNS
 */
export declare const FallbackOrigin: import("../../Resource.ts").ResourceClass<FallbackOrigin>;
export declare const isFallbackOrigin: (value: unknown) => value is FallbackOrigin;
export declare const FallbackOriginProvider: () => import("effect/Layer").Layer<Provider.Provider<FallbackOrigin>, never, CloudflareEnvironment | customHostnames.CloudflareOpContext>;
//# sourceMappingURL=FallbackOrigin.d.ts.map