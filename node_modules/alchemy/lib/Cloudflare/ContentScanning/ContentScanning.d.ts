import * as contentScanning from "@distilled.cloud/cloudflare/content-scanning";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.ContentScanning.ContentScanning";
type TypeId = typeof TypeId;
/** The wire status values Cloudflare uses for Content Scanning. */
type ContentScanningStatus = "enabled" | "disabled";
export interface Props {
    /**
     * Zone to manage WAF Content Scanning on. Stable — changing the zone
     * triggers a replacement (the old zone's status is restored to the
     * value it had before Alchemy managed it).
     */
    zoneId: string;
    /**
     * Whether Content Scanning is enabled on the zone. Mutable — toggled
     * in place via the settings endpoint.
     *
     * Enabling requires the WAF Content Scanning Enterprise add-on;
     * without it Cloudflare rejects the call with the typed
     * `ContentScanningNotEntitled` error.
     *
     * @default true
     */
    enabled?: boolean;
}
export interface Attributes {
    /** Zone the setting belongs to. */
    zoneId: string;
    /** Whether Content Scanning is currently enabled. */
    enabled: boolean;
    /** ISO 8601 timestamp of the last status modification, if reported. */
    modified: string | undefined;
    /**
     * The status (`enabled`/`disabled`) the zone had before Alchemy first
     * managed it. Restored on destroy, so deleting the resource puts the
     * zone back the way it was found.
     */
    initialValue: ContentScanningStatus;
}
export type ContentScanning = Resource<TypeId, Props, Attributes, never, Providers>;
/**
 * WAF Content Scanning (malicious uploads detection) on a Cloudflare zone —
 * the `/zones/{zone_id}/content-upload-scan/settings` singleton toggle.
 *
 * Content Scanning is a zone singleton: the setting always exists (default
 * `disabled`), so this resource never creates or deletes anything physical.
 * Reconcile PUTs the status only when the observed value differs from the
 * desired one; destroy restores the status the zone had before Alchemy
 * first managed it (captured as `initialValue`).
 *
 * Content Scanning is an Enterprise paid add-on. Reading the status works
 * on every plan, but enabling it on a zone without the add-on fails with
 * the typed `ContentScanningNotEntitled` error.
 * ### Enabling Content Scanning
 * **Example:** Turn on malicious-upload scanning for a zone
 * ```typescript
 * const zone = yield* Cloudflare.Zone.Zone("Site", { name: "example.com" });
 *
 * yield* Cloudflare.ContentScanning.ContentScanning("UploadScanning", {
 *   zoneId: zone.zoneId,
 * });
 * ```
 *
 * **Example:** Pin Content Scanning off
 * ```typescript
 * yield* Cloudflare.ContentScanning.ContentScanning("UploadScanning", {
 *   zoneId: zone.zoneId,
 *   enabled: false,
 * });
 * ```
 *
 * ### Custom scan expressions
 * **Example:** Scan a JSON-embedded file field
 * ```typescript
 * const scanning = yield* Cloudflare.ContentScanning.ContentScanning("UploadScanning", {
 *   zoneId: zone.zoneId,
 * });
 *
 * yield* Cloudflare.ContentScanning.Expression("ScanJsonFile", {
 *   zoneId: scanning.zoneId,
 *   payload: 'lookup_json_string(http.request.body.raw, "file")',
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/waf/detections/malicious-uploads/
 *
 * @resource
 * @product Content Scanning
 * @category Application Security
 */
export declare const ContentScanning: import("../../Resource.ts").ResourceClass<ContentScanning>;
/**
 * Returns true if the given value is a ContentScanning resource.
 */
export declare const isContentScanning: (value: unknown) => value is ContentScanning;
export declare const ContentScanningProvider: () => import("effect/Layer").Layer<Provider.Provider<ContentScanning>, never, CloudflareEnvironment | contentScanning.CloudflareOpContext>;
export {};
//# sourceMappingURL=ContentScanning.d.ts.map