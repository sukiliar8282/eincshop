import * as magicTransit from "@distilled.cloud/cloudflare/magic-transit";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.MagicTransit.StaticRoute";
type TypeId = typeof TypeId;
/**
 * Scope of an ECMP static route — restricts the route to specific
 * Cloudflare colos or regions.
 */
export interface MagicStaticRouteScope {
    /** List of colo names the route applies to. */
    coloNames?: string[];
    /** List of colo regions the route applies to. */
    coloRegions?: string[];
}
export interface MagicStaticRouteProps {
    /**
     * IP prefix in CIDR notation that this route matches.
     */
    prefix: string;
    /**
     * The next-hop IP address for the static route — typically a Magic
     * tunnel's customer-side interface address.
     */
    nexthop: string;
    /**
     * Priority of the static route. Lower values are preferred.
     * @default 100
     */
    priority?: number;
    /**
     * An optional human-provided description of the static route.
     */
    description?: string;
    /**
     * Optional weight for ECMP routes.
     */
    weight?: number;
    /**
     * Used only for ECMP routes — restrict the route to colos/regions.
     */
    scope?: MagicStaticRouteScope;
}
export interface MagicStaticRouteAttributes {
    /** Cloudflare-assigned identifier of the static route. */
    routeId: string;
    /** The Cloudflare account the route belongs to. */
    accountId: string;
    /** IP prefix in CIDR notation. */
    prefix: string;
    /** The next-hop IP address. */
    nexthop: string;
    /** Priority of the static route. */
    priority: number;
    /** The route description, if set. */
    description: string | undefined;
    /** ECMP weight, if set. */
    weight: number | undefined;
    /** ECMP scope, if set. */
    scope: MagicStaticRouteScope | undefined;
    /** ISO8601 creation timestamp. */
    createdOn: string | undefined;
    /** ISO8601 last-modified timestamp. */
    modifiedOn: string | undefined;
}
export type MagicStaticRoute = Resource<TypeId, MagicStaticRouteProps, MagicStaticRouteAttributes, never, Providers>;
/**
 * A Magic Transit / Magic WAN static route — steers traffic for a prefix
 * to a next-hop (usually a Magic tunnel interface address).
 *
 * Requires a Magic Transit or Magic WAN subscription on the account —
 * accounts that are not onboarded receive a typed
 * `MagicTransitNotOnboarded` error (Cloudflare code 1012).
 *
 * All properties are mutable in place via PUT. A route's practical
 * identity is the `(prefix, nexthop, priority)` triple — when state is
 * lost, `read` scans for a matching route and reports it as `Unowned` so
 * takeover is gated behind `--adopt`.
 * ### Creating a static route
 * **Example:** Route a prefix over a GRE tunnel
 * ```typescript
 * const tunnel = yield* Cloudflare.MagicTransit.GreTunnel("office", {
 *   name: "office-gre-1",
 *   cloudflareGreEndpoint: "203.0.113.1",
 *   customerGreEndpoint: "198.51.100.1",
 *   interfaceAddress: "10.213.0.8/31",
 * });
 *
 * yield* Cloudflare.MagicTransit.MagicStaticRoute("office-route", {
 *   prefix: "10.100.0.0/24",
 *   nexthop: "10.213.0.9",
 *   priority: 100,
 * });
 * ```
 *
 * **Example:** ECMP route scoped to a region
 * ```typescript
 * yield* Cloudflare.MagicTransit.MagicStaticRoute("ecmp-route", {
 *   prefix: "10.100.0.0/24",
 *   nexthop: "10.213.0.9",
 *   priority: 100,
 *   weight: 50,
 *   scope: { coloRegions: ["ENAM"] },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/magic-transit/how-to/configure-static-routes/
 *
 * @resource
 * @product Magic Transit
 * @category Network
 */
export declare const MagicStaticRoute: import("../../Resource.ts").ResourceClass<MagicStaticRoute>;
/**
 * Returns true if the given value is a MagicStaticRoute resource.
 */
export declare const isMagicStaticRoute: (value: unknown) => value is MagicStaticRoute;
export declare const MagicStaticRouteProvider: () => import("effect/Layer").Layer<Provider.Provider<MagicStaticRoute>, never, CloudflareEnvironment | magicTransit.CloudflareOpContext>;
export {};
//# sourceMappingURL=StaticRoute.d.ts.map