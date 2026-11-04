import * as resourceTagging from "@distilled.cloud/cloudflare/resource-tagging";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Tags.ZoneResourceTags";
type TypeId = typeof TypeId;
/**
 * Zone-level resource types that can carry tags via Cloudflare's unified
 * resource-tagging API.
 */
export type ZoneTagResourceType = "access_application_policy" | "api_gateway_operation" | "custom_certificate" | "custom_hostname" | "dns_record" | "managed_client_certificate" | "zone" | (string & {});
export interface ZoneResourceTagsProps {
    /**
     * Zone the tagged resource lives in.
     *
     * Stable — changing the zone triggers replacement.
     */
    zoneId: string;
    /**
     * The type of the zone-level resource the tags attach to (e.g.
     * `dns_record`, `custom_hostname`, or `zone` for the zone itself).
     *
     * Stable — the `(resourceType, resourceId)` pair is the tag set's
     * identity, so changing it triggers a replacement. Declared as plain
     * `string` (narrowed to {@link ZoneTagResourceType}) so `diff` can
     * compare without resolving an `Input`.
     */
    resourceType: ZoneTagResourceType;
    /**
     * The ID of the resource the tags attach to (e.g. a DNS record ID or
     * the zone ID itself for `resourceType: "zone"`).
     *
     * Stable — changing it triggers a replacement.
     */
    resourceId: string;
    /**
     * Access application identifier. Required when `resourceType` is
     * `access_application_policy`, ignored otherwise.
     *
     * Stable — changing it triggers a replacement.
     */
    accessApplicationId?: string;
    /**
     * Key/value tags to attach to the resource. The PUT API replaces the
     * full tag set, so this is the complete desired set — keys absent here
     * are removed from the resource on the next reconcile.
     *
     * An empty record is indistinguishable from "no tags" on Cloudflare's
     * side, so prefer at least one entry.
     */
    tags: Record<string, string>;
}
export interface ZoneResourceTagsAttributes {
    /** Zone the tagged resource lives in. */
    zoneId: string;
    /** The type of the tagged resource. */
    resourceType: ZoneTagResourceType;
    /** The ID of the tagged resource. */
    resourceId: string;
    /** Access application identifier (only set for `access_application_policy`). */
    accessApplicationId: string | undefined;
    /** The full tag set currently attached to the resource. */
    tags: Record<string, string>;
    /** ETag of the tag set, usable for optimistic concurrency control. */
    etag: string;
}
export type ZoneResourceTags = Resource<TypeId, ZoneResourceTagsProps, ZoneResourceTagsAttributes, never, Providers>;
/**
 * Key/value tags attached to a zone-level Cloudflare resource via the
 * unified resource-tagging API (open beta).
 *
 * The tag SET is the resource: `PUT` replaces the full set, and deleting
 * this resource clears every tag from the target. Cloudflare reports an
 * untagged (or unknown) resource as an empty tag set rather than a 404, so
 * an empty set is treated as "absent".
 *
 * Safety: tags carry no ownership markers. On a cold read (no prior state)
 * a non-empty tag set on the target resource is reported as `Unowned`, and
 * the engine refuses to take it over (i.e. clobber the existing tags)
 * unless `--adopt` or `adopt(true)` is set.
 * ### Tagging a resource
 * **Example:** Tag a DNS record
 * ```typescript
 * const record = yield* Cloudflare.DNS.Record("api", {
 *   zoneId: zone.zoneId,
 *   name: "api.example.com",
 *   type: "A",
 *   content: "203.0.113.42",
 * });
 *
 * yield* Cloudflare.Tags.ZoneResourceTags("api-tags", {
 *   zoneId: zone.zoneId,
 *   resourceType: "dns_record",
 *   resourceId: record.recordId,
 *   tags: { team: "platform", env: "production" },
 * });
 * ```
 *
 * **Example:** Tag the zone itself
 * ```typescript
 * yield* Cloudflare.Tags.ZoneResourceTags("zone-tags", {
 *   zoneId: zone.zoneId,
 *   resourceType: "zone",
 *   resourceId: zone.zoneId,
 *   tags: { "cost-center": "eng-42" },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/fundamentals/account/tags/
 *
 * @resource
 * @product Resource Tagging
 * @category Account & Identity
 */
export declare const ZoneResourceTags: import("../../Resource.ts").ResourceClass<ZoneResourceTags>;
/**
 * Returns true if the given value is a ZoneResourceTags resource.
 */
export declare const isZoneResourceTags: (value: unknown) => value is ZoneResourceTags;
export declare const ZoneResourceTagsProvider: () => import("effect/Layer").Layer<Provider.Provider<ZoneResourceTags>, never, CloudflareEnvironment | resourceTagging.CloudflareOpContext>;
export {};
//# sourceMappingURL=ZoneResourceTags.d.ts.map