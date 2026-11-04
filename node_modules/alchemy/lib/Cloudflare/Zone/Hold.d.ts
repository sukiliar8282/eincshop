import * as zones from "@distilled.cloud/cloudflare/zones";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Zone.Hold";
type TypeId = typeof TypeId;
export type HoldProps = {
    /**
     * Zone to place the hold on. Stable — changing the zone triggers a
     * replacement (the hold is removed from the old zone and placed on the
     * new one).
     */
    zoneId: string;
    /**
     * Extend the hold to block any subdomain of the zone, as well as
     * SSL4SaaS Custom Hostnames. For example, a hold on `example.com` with
     * `includeSubdomains: true` also blocks `staging.example.com` from
     * being added to another account.
     *
     * Mutable — patched in place.
     * @default false
     */
    includeSubdomains?: boolean;
};
export type HoldAttributes = {
    /** Zone the hold is placed on. */
    zoneId: string;
    /** Whether the hold is currently active. */
    hold: boolean;
    /**
     * If present and future-dated, the hold is temporarily disabled and
     * will automatically re-enable at this RFC3339 timestamp.
     */
    holdAfter: string | undefined;
    /** Whether the hold also blocks subdomains and SSL4SaaS Custom Hostnames. */
    includeSubdomains: boolean;
};
export type Hold = Resource<TypeId, HoldProps, HoldAttributes, never, Providers>;
/**
 * A Cloudflare zone hold (`/zones/{zone_id}/hold`) — prevents the zone's
 * hostname (and optionally its subdomains) from being added to another
 * Cloudflare account while the hold is active.
 *
 * Zone holds are only available on **Enterprise** zones. On other plans
 * every create/patch fails with Cloudflare code 1005, surfaced as the typed
 * `ZoneHoldsRequireEnterprise` error.
 *
 * Destroying the resource removes the hold. The delete is idempotent —
 * removing a hold that is already gone (or whose zone was deleted
 * out-of-band) succeeds.
 * ### Holding a zone
 * **Example:** Place a hold on a zone
 * ```typescript
 * const hold = yield* Cloudflare.Zone.Hold("MyHold", {
 *   zoneId: zone.zoneId,
 * });
 * ```
 *
 * **Example:** Hold the zone and all of its subdomains
 * ```typescript
 * yield* Cloudflare.Zone.Hold("MyHold", {
 *   zoneId: zone.zoneId,
 *   includeSubdomains: true,
 * });
 * ```
 *
 * ### Adopting an existing hold
 * **Example:** Take over a hold that was placed outside Alchemy
 * ```typescript
 * import { adopt } from "alchemy/AdoptPolicy";
 * // A hold carries no ownership markers, so the engine refuses to take
 * // over a pre-existing hold unless you opt in with `adopt(true)`.
 * const hold = yield* Cloudflare.Zone.Hold("MyHold", {
 *   zoneId: zone.zoneId,
 * }).pipe(adopt(true));
 * ```
 *
 * @see https://developers.cloudflare.com/fundamentals/account/account-security/zone-holds/
 *
 * @resource
 * @product Zones
 * @category Domains & DNS
 */
export declare const Hold: import("../../Resource.ts").ResourceClass<Hold>;
/**
 * Returns true if the given value is a Hold resource.
 */
export declare const isHold: (value: unknown) => value is Hold;
export declare const HoldProvider: () => import("effect/Layer").Layer<Provider.Provider<Hold>, never, CloudflareEnvironment | zones.CloudflareOpContext>;
export {};
//# sourceMappingURL=Hold.d.ts.map