import * as emailRouting from "@distilled.cloud/cloudflare/email-routing";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
import { type Reference } from "../Zone/index.ts";
export type RoutingStatus = "ready" | "unconfigured" | "misconfigured" | "misconfigured/locked" | "unlocked";
export type RoutingProps = {
    /**
     * Zone to enable email routing on. Accepts a zone id, a zone name
     * (`example.com`), or a `{ zoneId, name? }` object.
     */
    zone: Reference;
    /**
     * Whether to enable Email Routing on the zone.
     *
     * @default true
     */
    enabled?: boolean;
};
export type Routing = Resource<"Cloudflare.Email.Routing", RoutingProps, {
    routingId: string;
    zoneId: string;
    name: string;
    enabled: boolean;
    status: RoutingStatus | undefined;
}, never, Providers>;
/**
 * Enables Cloudflare Email Routing on a zone. This is the prerequisite for
 * receiving mail at any address on the domain and for sending email from a
 * Worker via `send_email` bindings.
 * ### Enabling Email Routing
 * **Example:** Enable on a zone you own
 * ```typescript
 * const routing = yield* Cloudflare.Email.Routing("Routing", {
 *   zone: "example.com",
 * });
 * ```
 *
 * @resource
 * @product Email
 * @category Email
 */
export declare const Routing: import("../../Resource.ts").ResourceClass<Routing>;
export declare const RoutingProvider: () => import("effect/Layer").Layer<Provider.Provider<Routing>, never, CloudflareEnvironment | emailRouting.CloudflareOpContext>;
//# sourceMappingURL=Routing.d.ts.map