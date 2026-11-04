import * as resourceSharing from "@distilled.cloud/cloudflare/resource-sharing";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
import type { ShareableResourceType, ShareStatus } from "./Share.ts";
declare const TypeId: "Cloudflare.ResourceSharing.ShareResource";
type TypeId = typeof TypeId;
export type ShareResourceProps = {
    /**
     * The share this resource belongs to. Changing the share triggers a
     * replacement.
     */
    shareId: string;
    /**
     * Type of the shared resource (e.g. `gateway-policy`). Changing the type
     * triggers a replacement.
     */
    resourceType: ShareableResourceType;
    /**
     * Identifier of the resource being shared (e.g. the gateway policy id).
     * Changing it triggers a replacement.
     */
    resourceId: string;
    /**
     * Account that owns the resource being shared. Changing it triggers a
     * replacement.
     * @default the current account
     */
    resourceAccountId?: string;
    /**
     * Resource metadata forwarded to the share API. The only mutable field.
     * @default {}
     */
    meta?: unknown;
};
export type ShareResourceAttributes = {
    /**
     * Server-assigned share-resource identifier — distinct from the shared
     * `resourceId`. Stable across updates.
     */
    shareResourceId: string;
    /**
     * The Cloudflare account that owns the share.
     */
    accountId: string;
    /**
     * The share this resource belongs to.
     */
    shareId: string;
    /**
     * Type of the shared resource.
     */
    resourceType: ShareableResourceType;
    /**
     * Identifier of the resource being shared.
     */
    resourceId: string;
    /**
     * Account that owns the resource being shared.
     */
    resourceAccountId: string;
    /**
     * Resource metadata.
     */
    meta: unknown;
    /**
     * Version of the shared resource.
     */
    resourceVersion: number;
    /**
     * Lifecycle status of the share resource.
     */
    status: ShareStatus;
    /**
     * When the share resource was created.
     */
    created: string;
    /**
     * When the share resource was last modified.
     */
    modified: string;
};
export type ShareResource = Resource<TypeId, ShareResourceProps, ShareResourceAttributes, never, Providers>;
/**
 * A resource entry on an existing Cloudflare share — adds a shareable
 * resource (gateway policy, custom ruleset, …) to a `Share` incrementally.
 *
 * Only `meta` is mutable in place; changing the share, type, id, or owning
 * account triggers a replacement. A share must always retain at least one
 * resource — the last entry cannot be deleted (delete the `Share` instead).
 * Do not manage the same entry both inline on `Share.resources` and through
 * this resource.
 * ### Adding a Resource to a Share
 * **Example:** Share an additional gateway policy
 * ```typescript
 * const entry = yield* Cloudflare.ResourceSharing.ShareResource("ExtraPolicy", {
 *   shareId: share.shareId,
 *   resourceType: "gateway-policy",
 *   resourceId: policy.ruleId,
 * });
 * ```
 *
 * ### Updating Metadata
 * **Example:** Update `meta` in place
 * ```typescript
 * const entry = yield* Cloudflare.ResourceSharing.ShareResource("ExtraPolicy", {
 *   shareId: share.shareId,
 *   resourceType: "gateway-policy",
 *   resourceId: policy.ruleId,
 *   meta: { note: "rotated" },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/fundamentals/manage-account-resources/
 *
 * @resource
 * @product Resource Sharing
 * @category Account & Identity
 */
export declare const ShareResource: import("../../Resource.ts").ResourceClass<ShareResource>;
/**
 * Returns true if the given value is a ShareResource resource.
 */
export declare const isShareResource: (value: unknown) => value is ShareResource;
export declare const ShareResourceProvider: () => import("effect/Layer").Layer<Provider.Provider<ShareResource>, never, CloudflareEnvironment | resourceSharing.CloudflareOpContext>;
export {};
//# sourceMappingURL=ShareResource.d.ts.map