import * as dns from "@distilled.cloud/cloudflare/dns";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const DnsViewTypeId: "Cloudflare.DNS.View";
type DnsViewTypeId = typeof DnsViewTypeId;
export interface ViewProps {
    /**
     * Name of the view. If omitted, a unique name is generated from the
     * app, stage, and logical ID.
     *
     * Mutable — patched in place.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Zones (by id) linked to this view. Internal DNS queries resolved
     * through the view consult these zones.
     *
     * Mutable — patched in place.
     */
    zones: string[];
}
export interface ViewAttributes {
    /** Identifier of the view. */
    viewId: string;
    /** The Cloudflare account the view belongs to. */
    accountId: string;
    /** Name of the view. */
    name: string;
    /** Zone ids linked to the view. */
    zones: string[];
    /** When the view was created. */
    createdTime: string;
    /** When the view was last modified. */
    modifiedTime: string;
}
export type View = Resource<DnsViewTypeId, ViewProps, ViewAttributes, never, Providers>;
/**
 * An Internal DNS view (`/accounts/{account_id}/dns_settings/views`) —
 * a named set of internal zones that DNS queries can be resolved
 * against, for split-horizon / internal DNS setups.
 *
 * Requires the Enterprise Internal DNS entitlement on the account
 * (creation fails with `InternalDnsNotAvailable` otherwise). Both
 * `name` and `zones` are mutable in place.
 * ### Creating a View
 * **Example:** View over internal zones
 * ```typescript
 * const view = yield* Cloudflare.DNS.View("Internal", {
 *   zones: [internalZone.zoneId],
 * });
 * ```
 *
 * **Example:** View with an explicit name
 * ```typescript
 * const view = yield* Cloudflare.DNS.View("Internal", {
 *   name: "datacenter-east",
 *   zones: [zoneA.zoneId, zoneB.zoneId],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/dns/internal-dns/
 *
 * @resource
 * @product DNS
 * @category Domains & DNS
 */
export declare const View: import("../../Resource.ts").ResourceClass<View>;
/**
 * Returns true if the given value is a View resource.
 */
export declare const isView: (value: unknown) => value is View;
export declare const ViewProvider: () => import("effect/Layer").Layer<Provider.Provider<View>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | dns.CloudflareOpContext>;
export {};
//# sourceMappingURL=View.d.ts.map