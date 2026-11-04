import * as ssl from "@distilled.cloud/cloudflare/ssl";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Ssl.UniversalSsl";
type TypeId = typeof TypeId;
export type UniversalSslProps = {
    /**
     * Zone whose Universal SSL setting is managed. Stable — changing the
     * zone triggers a replacement (the old zone's setting is restored to
     * the value it had before Alchemy managed it).
     */
    zoneId: string;
    /**
     * Whether Universal SSL certificates are issued for the zone.
     *
     * Disabling removes any currently active Universal SSL certificates
     * for the zone from the edge and prevents future Universal SSL
     * certificates from being ordered — visitors will see TLS errors
     * unless the zone has advanced/custom certificates covering its
     * hostnames.
     *
     * Mutable — patched in place.
     */
    enabled: boolean;
};
export type UniversalSslAttributes = {
    /** Zone the setting belongs to. */
    zoneId: string;
    /** Whether Universal SSL is currently enabled for the zone. */
    enabled: boolean;
    /**
     * The value the setting had before Alchemy first patched it. Restored
     * on destroy, so deleting the resource puts the zone back the way it
     * was found.
     */
    initialEnabled: boolean;
};
export type UniversalSsl = Resource<TypeId, UniversalSslProps, UniversalSslAttributes, never, Providers>;
/**
 * The Universal SSL setting of a Cloudflare zone
 * (`/zones/{zone_id}/ssl/universal/settings`).
 *
 * Universal SSL is a zone singleton — the setting always exists (Cloudflare
 * defaults it to enabled), so this resource never creates or deletes
 * anything physical. Reconcile patches the setting when the observed value
 * differs from the desired one; destroy restores the value the setting had
 * before Alchemy first managed it (captured as `initialEnabled`).
 *
 * **Warning:** disabling Universal SSL removes any active Universal SSL
 * certificates for the zone from the edge. Visitors will see TLS errors
 * unless advanced/custom certificates cover the zone's hostnames.
 * ### Managing Universal SSL
 * **Example:** Disable Universal SSL for a zone
 * ```typescript
 * yield* Cloudflare.Ssl.UniversalSsl("UniversalSsl", {
 *   zoneId: zone.zoneId,
 *   enabled: false,
 * });
 * ```
 *
 * **Example:** Pin Universal SSL enabled
 * ```typescript
 * yield* Cloudflare.Ssl.UniversalSsl("UniversalSsl", {
 *   zoneId: zone.zoneId,
 *   enabled: true,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/api/resources/ssl/subresources/universal/subresources/settings/
 *
 * @resource
 * @product SSL/TLS
 * @category SSL/TLS & Certificates
 */
export declare const UniversalSsl: import("../../Resource.ts").ResourceClass<UniversalSsl>;
/**
 * Returns true if the given value is a UniversalSsl resource.
 */
export declare const isUniversalSsl: (value: unknown) => value is UniversalSsl;
export declare const UniversalSslProvider: () => import("effect/Layer").Layer<Provider.Provider<UniversalSsl>, never, CloudflareEnvironment | ssl.CloudflareOpContext>;
export {};
//# sourceMappingURL=UniversalSsl.d.ts.map