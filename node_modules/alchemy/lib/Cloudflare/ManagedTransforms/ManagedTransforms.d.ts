import * as managedTransforms from "@distilled.cloud/cloudflare/managed-transforms";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.ManagedTransforms.ManagedTransforms";
type TypeId = typeof TypeId;
/**
 * Identifier of a Cloudflare managed request transform — the built-in
 * request-header transforms Cloudflare offers on
 * `/zones/{zone_id}/managed_headers`. The open `(string & {})` tail keeps
 * the type forward-compatible with transforms Cloudflare adds later.
 */
export type ManagedRequestTransformId = "add_bot_protection_headers" | "add_client_certificate_headers" | "add_true_client_ip_headers" | "add_visitor_location_headers" | "add_waf_credential_check_status_header" | "remove_visitor_ip_headers" | (string & {});
/**
 * Identifier of a Cloudflare managed response transform — the built-in
 * response-header transforms Cloudflare offers on
 * `/zones/{zone_id}/managed_headers`. The open `(string & {})` tail keeps
 * the type forward-compatible with transforms Cloudflare adds later.
 */
export type ManagedResponseTransformId = "add_security_headers" | "remove_x-powered-by_header" | (string & {});
export interface Props {
    /**
     * Zone whose managed transforms are managed. Stable — changing the zone
     * triggers a replacement (the old zone's managed transforms are restored
     * to the enabled states they had before Alchemy managed them).
     */
    zoneId: string;
    /**
     * Desired enabled state per managed **request** transform id (e.g.
     * `{ add_visitor_location_headers: true }`). Only the ids you name here
     * are managed — every other transform on the zone is left untouched.
     *
     * Mutable — patched in place.
     *
     * @default {}
     */
    requestHeaders?: Partial<Record<ManagedRequestTransformId, boolean>>;
    /**
     * Desired enabled state per managed **response** transform id (e.g.
     * `{ "remove_x-powered-by_header": true }`). Only the ids you name here
     * are managed — every other transform on the zone is left untouched.
     *
     * Mutable — patched in place.
     *
     * @default {}
     */
    responseHeaders?: Partial<Record<ManagedResponseTransformId, boolean>>;
}
/**
 * Observed state of a single managed transform on the zone.
 */
export interface ManagedTransformState {
    /** The transform's identifier (e.g. `add_visitor_location_headers`). */
    id: string;
    /** Whether the transform is currently enabled on the zone. */
    enabled: boolean;
    /** Whether the transform conflicts with another enabled feature. */
    hasConflict: boolean;
    /** Ids of the transforms this one conflicts with, when Cloudflare reports them. */
    conflictsWith: string[] | undefined;
}
export interface Attributes {
    /** Zone that owns these managed transforms. */
    zoneId: string;
    /** Observed state of every managed request transform on the zone. */
    requestHeaders: ManagedTransformState[];
    /** Observed state of every managed response transform on the zone. */
    responseHeaders: ManagedTransformState[];
    /**
     * Snapshot of every request transform's enabled state observed **before**
     * this resource first wrote to the zone. `delete` restores the ids this
     * resource managed to these values.
     */
    initialRequestHeaders: Record<string, boolean>;
    /**
     * Snapshot of every response transform's enabled state observed
     * **before** this resource first wrote to the zone. `delete` restores the
     * ids this resource managed to these values.
     */
    initialResponseHeaders: Record<string, boolean>;
}
export type ManagedTransforms = Resource<TypeId, Props, Attributes, never, Providers>;
/**
 * The managed request/response header transforms of a Cloudflare zone
 * (`/zones/{zone_id}/managed_headers`) — a zone-scoped **singleton**: every
 * zone always carries the full catalog of managed transforms (each with an
 * enabled flag), so there is no create or delete on the Cloudflare side.
 *
 * Reconciling this resource adopts the singleton and patches **only the
 * transform ids you name** in `requestHeaders` / `responseHeaders` — every
 * other transform is left exactly as found (dashboard- or otherwise-managed
 * toggles are never clobbered).
 *
 * On destroy, the resource restores the ids it managed to the enabled
 * states observed before its first write (the `initialRequestHeaders` /
 * `initialResponseHeaders` snapshots). Transforms that were never named are
 * not touched.
 *
 * Some transforms are plan-gated (e.g. `add_bot_protection_headers`
 * requires Bot Management) — enabling those fails server-side on
 * unentitled zones.
 * ### Request transforms
 * **Example:** Add visitor location headers
 * ```typescript
 * yield* Cloudflare.ManagedTransforms.ManagedTransforms("Transforms", {
 *   zoneId: zone.zoneId,
 *   requestHeaders: { add_visitor_location_headers: true },
 * });
 * ```
 *
 * **Example:** Remove visitor IP headers
 * ```typescript
 * yield* Cloudflare.ManagedTransforms.ManagedTransforms("Transforms", {
 *   zoneId: zone.zoneId,
 *   requestHeaders: { remove_visitor_ip_headers: true },
 * });
 * ```
 *
 * ### Response transforms
 * **Example:** Harden responses
 * ```typescript
 * yield* Cloudflare.ManagedTransforms.ManagedTransforms("Transforms", {
 *   zoneId: zone.zoneId,
 *   responseHeaders: {
 *     add_security_headers: true,
 *     "remove_x-powered-by_header": true,
 *   },
 * });
 * ```
 *
 * ### Mixed
 * **Example:** Manage request and response transforms together
 * ```typescript
 * yield* Cloudflare.ManagedTransforms.ManagedTransforms("Transforms", {
 *   zoneId: zone.zoneId,
 *   requestHeaders: { add_true_client_ip_headers: true },
 *   responseHeaders: { "remove_x-powered-by_header": false },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/rules/transform/managed-transforms/
 *
 * @resource
 * @product Managed Transforms
 * @category Rules & Configuration
 */
export declare const ManagedTransforms: import("../../Resource.ts").ResourceClass<ManagedTransforms>;
/**
 * Returns true if the given value is a ManagedTransforms resource.
 */
export declare const isManagedTransforms: (value: unknown) => value is ManagedTransforms;
export declare const ManagedTransformsProvider: () => import("effect/Layer").Layer<Provider.Provider<ManagedTransforms>, never, CloudflareEnvironment | managedTransforms.CloudflareOpContext>;
export {};
//# sourceMappingURL=ManagedTransforms.d.ts.map