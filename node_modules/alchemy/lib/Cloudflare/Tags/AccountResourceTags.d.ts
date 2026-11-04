import * as resourceTagging from "@distilled.cloud/cloudflare/resource-tagging";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Tags.AccountResourceTags";
type TypeId = typeof TypeId;
/**
 * Account-level resource types that can carry tags via Cloudflare's unified
 * resource-tagging API.
 */
export type AccountTagResourceType = "access_application" | "access_group" | "account" | "ai_gateway" | "alerting_policy" | "alerting_webhook" | "cloudflared_tunnel" | "d1_database" | "durable_object_namespace" | "gateway_list" | "gateway_rule" | "image" | "kv_namespace" | "queue" | "r2_bucket" | "resource_share" | "stream_live_input" | "stream_video" | "worker" | "worker_version" | (string & {});
export interface AccountResourceTagsProps {
    /**
     * The type of the account-level resource the tags attach to (e.g.
     * `kv_namespace`, `worker`, `r2_bucket`, or `account` for the account
     * itself).
     *
     * Stable — the `(resourceType, resourceId)` pair is the tag set's
     * identity, so changing it triggers a replacement. Declared as plain
     * `string` (narrowed to {@link AccountTagResourceType}) so `diff` can
     * compare without resolving an `Input`.
     */
    resourceType: AccountTagResourceType;
    /**
     * The ID of the resource the tags attach to (e.g. a KV namespace ID or
     * the account ID itself for `resourceType: "account"`).
     *
     * Stable — changing it triggers a replacement.
     */
    resourceId: string;
    /**
     * Worker identifier. Required when `resourceType` is `worker_version`,
     * ignored otherwise.
     *
     * Stable — changing it triggers a replacement.
     */
    workerId?: string;
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
export interface AccountResourceTagsAttributes {
    /** The Cloudflare account the tagged resource belongs to. */
    accountId: string;
    /** The type of the tagged resource. */
    resourceType: AccountTagResourceType;
    /** The ID of the tagged resource. */
    resourceId: string;
    /** Worker identifier (only set for `worker_version` resources). */
    workerId: string | undefined;
    /** The full tag set currently attached to the resource. */
    tags: Record<string, string>;
    /** ETag of the tag set, usable for optimistic concurrency control. */
    etag: string;
}
export type AccountResourceTags = Resource<TypeId, AccountResourceTagsProps, AccountResourceTagsAttributes, never, Providers>;
/**
 * Key/value tags attached to an account-level Cloudflare resource via the
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
 * **Example:** Tag a KV namespace
 * ```typescript
 * const kv = yield* Cloudflare.KV.Namespace("cache", {});
 *
 * yield* Cloudflare.Tags.AccountResourceTags("cache-tags", {
 *   resourceType: "kv_namespace",
 *   resourceId: kv.namespaceId,
 *   tags: { team: "platform", env: "production" },
 * });
 * ```
 *
 * **Example:** Tag the account itself
 * ```typescript
 * yield* Cloudflare.Tags.AccountResourceTags("account-tags", {
 *   resourceType: "account",
 *   resourceId: accountId,
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
export declare const AccountResourceTags: import("../../Resource.ts").ResourceClass<AccountResourceTags>;
/**
 * Returns true if the given value is an AccountResourceTags resource.
 */
export declare const isAccountResourceTags: (value: unknown) => value is AccountResourceTags;
export declare const AccountResourceTagsProvider: () => import("effect/Layer").Layer<Provider.Provider<AccountResourceTags>, never, CloudflareEnvironment | resourceTagging.CloudflareOpContext>;
export {};
//# sourceMappingURL=AccountResourceTags.d.ts.map