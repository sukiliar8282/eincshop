import * as magicTransit from "@distilled.cloud/cloudflare/magic-transit";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.MagicTransit.App";
type TypeId = typeof TypeId;
export interface MagicAppProps {
    /**
     * Display name for the app.
     */
    name: string;
    /**
     * Category of the app, e.g. `"Collaboration"`.
     */
    type: string;
    /**
     * FQDNs to associate with traffic decisions.
     */
    hostnames?: string[];
    /**
     * IPv4 CIDRs to associate with traffic decisions. (IPv6 CIDRs are
     * currently unsupported.)
     */
    ipSubnets?: string[];
}
export interface MagicAppAttributes {
    /** Magic account app ID. */
    appId: string;
    /** The Cloudflare account the app belongs to. */
    accountId: string;
    /** Display name for the app. */
    name: string;
    /** Category of the app. */
    type: string;
    /** FQDNs associated with traffic decisions, if set. */
    hostnames: string[] | undefined;
    /** IPv4 CIDRs associated with traffic decisions, if set. */
    ipSubnets: string[] | undefined;
}
export type MagicApp = Resource<TypeId, MagicAppProps, MagicAppAttributes, never, Providers>;
/**
 * A custom Magic WAN app — a named set of hostnames and/or IP subnets used
 * for traffic steering and policy decisions, complementing Cloudflare's
 * managed app definitions.
 *
 * Requires a Magic WAN subscription — accounts without it receive a typed
 * `MagicWanUnauthorized` error (Cloudflare code 1025).
 *
 * All properties are mutable in place via PATCH.
 * ### Creating an app
 * **Example:** App matching hostnames
 * ```typescript
 * const app = yield* Cloudflare.MagicTransit.MagicApp("crm", {
 *   name: "Internal CRM",
 *   type: "Business",
 *   hostnames: ["crm.example.com"],
 * });
 * ```
 *
 * **Example:** App matching IP subnets
 * ```typescript
 * const app = yield* Cloudflare.MagicTransit.MagicApp("voip", {
 *   name: "VoIP",
 *   type: "Communication",
 *   ipSubnets: ["192.0.2.0/24", "198.51.100.0/24"],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/magic-wan/configuration/apps/
 *
 * @resource
 * @product Magic Transit
 * @category Network
 */
export declare const MagicApp: import("../../Resource.ts").ResourceClass<MagicApp>;
/**
 * Returns true if the given value is a MagicApp resource.
 */
export declare const isMagicApp: (value: unknown) => value is MagicApp;
export declare const MagicAppProvider: () => import("effect/Layer").Layer<Provider.Provider<MagicApp>, never, CloudflareEnvironment | magicTransit.CloudflareOpContext>;
export {};
//# sourceMappingURL=App.d.ts.map