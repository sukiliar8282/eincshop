import * as apiGateway from "@distilled.cloud/cloudflare/api-gateway";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.ApiShield.Configuration";
type TypeId = typeof TypeId;
/**
 * A session identifier ("auth ID characteristic") used by API Shield to
 * correlate API requests to individual API consumers. Header and cookie
 * characteristics name the header/cookie carrying the session token; `jwt`
 * characteristics take a claim path expression in `name`.
 */
export type AuthIdCharacteristic = {
    /** Name of the header or cookie carrying the session identifier. */
    name: string;
    /** Where the session identifier lives on the request. */
    type: "header" | "cookie";
} | {
    /** Claim path expression locating the session identifier in the JWT. */
    name: string;
    /** The session identifier is a claim inside a validated JWT. */
    type: "jwt";
};
export interface ConfigurationProps {
    /**
     * Zone whose API Shield configuration is managed.
     *
     * Immutable — moving the configuration between zones triggers a
     * replacement (the old zone's configuration is restored to the value it
     * had before Alchemy managed it).
     */
    zoneId: string;
    /**
     * The session identifiers ("auth ID characteristics") API Shield uses to
     * attribute API requests to individual consumers — used by API Discovery
     * and volumetric abuse detection. At most 10.
     *
     * Mutable — written in place via PUT.
     */
    authIdCharacteristics: AuthIdCharacteristic[];
}
export interface ConfigurationAttributes {
    /** Zone whose API Shield configuration is managed. */
    zoneId: string;
    /** The session identifiers currently configured on the zone. */
    authIdCharacteristics: AuthIdCharacteristic[];
    /**
     * The session identifiers the zone had before Alchemy first managed the
     * configuration. Restored on destroy, so deleting the resource puts the
     * zone back the way it was found.
     */
    initialAuthIdCharacteristics: AuthIdCharacteristic[];
}
export type Configuration = Resource<TypeId, ConfigurationProps, ConfigurationAttributes, never, Providers>;
/**
 * The API Shield configuration of a Cloudflare zone — the session
 * identifiers ("auth ID characteristics") used to attribute API traffic to
 * individual consumers for API Discovery and volumetric abuse detection.
 *
 * The configuration is a zone singleton: it always exists (defaulting to an
 * empty list), so this resource never creates or deletes anything physical.
 * Reconcile PUTs the configuration when the observed characteristics differ
 * from the desired ones; destroy restores the characteristics the zone had
 * before Alchemy first managed them.
 *
 * Requires an API Shield entitlement (Enterprise) — on other plans every
 * operation fails with Cloudflare's `NotEntitled` error (code 10403).
 * ### Configuring session identifiers
 * **Example:** Identify sessions by an Authorization header
 * ```typescript
 * yield* Cloudflare.ApiShield.Configuration("SessionIds", {
 *   zoneId: zone.zoneId,
 *   authIdCharacteristics: [{ name: "authorization", type: "header" }],
 * });
 * ```
 *
 * **Example:** Identify sessions by a cookie and a JWT claim
 * ```typescript
 * yield* Cloudflare.ApiShield.Configuration("SessionIds", {
 *   zoneId: zone.zoneId,
 *   authIdCharacteristics: [
 *     { name: "session_id", type: "cookie" },
 *     { name: '$.cf.token_configurations[?(@.title=="api")].sub', type: "jwt" },
 *   ],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/api-shield/get-started/#session-identifiers
 *
 * @resource
 * @product API Shield
 * @category Application Security
 */
export declare const Configuration: import("../../Resource.ts").ResourceClass<Configuration>;
/**
 * Returns true if the given value is an Configuration resource.
 */
export declare const isConfiguration: (value: unknown) => value is Configuration;
export declare const ConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<Configuration>, never, CloudflareEnvironment | apiGateway.CloudflareOpContext>;
export {};
//# sourceMappingURL=Configuration.d.ts.map