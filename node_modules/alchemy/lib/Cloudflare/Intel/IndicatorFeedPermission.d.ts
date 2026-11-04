import * as intel from "@distilled.cloud/cloudflare/intel";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Intel.IndicatorFeedPermission";
type TypeId = typeof TypeId;
export interface IndicatorFeedPermissionProps {
    /**
     * The ID of the indicator feed to grant access to — e.g. `feed.feedId`.
     * Immutable — changing it triggers a replacement.
     */
    feedId: number;
    /**
     * The Cloudflare account tag of the consumer account being granted
     * access to the feed. Immutable — changing it triggers a replacement.
     */
    accountTag: string;
}
export interface IndicatorFeedPermissionAttributes {
    /** The ID of the indicator feed the grant is on. */
    feedId: number;
    /** The Cloudflare account tag of the consumer account. */
    accountTag: string;
    /** The Cloudflare account that owns the feed (the granting account). */
    accountId: string;
}
export type IndicatorFeedPermission = Resource<TypeId, IndicatorFeedPermissionProps, IndicatorFeedPermissionAttributes, never, Providers>;
/**
 * A permission grant on a Cloudflare custom Indicator Feed, giving another
 * Cloudflare account access to consume the feed.
 *
 * This is an existence-only resource: it has no mutable aspects beyond its
 * identity (feed + consumer account tag), so changing either property
 * triggers a replacement. Cloudflare's add/remove endpoints are idempotent
 * PUTs, so reconcile and delete are simple ensure/remove calls.
 *
 * Cloudflare exposes no API to list the grantees of a feed from the
 * provider side (the permissions "view" endpoint lists feeds the *calling*
 * account can consume), so `read` reports the last known state.
 * ### Granting Access
 * **Example:** Grant a consumer account access to a feed
 * ```typescript
 * const feed = yield* Cloudflare.Intel.IndicatorFeed("threat-feed", {
 *   description: "Indicators observed by our honeypots",
 * });
 *
 * yield* Cloudflare.Intel.IndicatorFeedPermission("partner-access", {
 *   feedId: feed.feedId,
 *   accountTag: "023e105f4ecef8ad9ca31a8372d0c353",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/security-center/indicator-feeds/
 *
 * @resource
 * @product Intel
 * @category Observability & Analytics
 */
export declare const IndicatorFeedPermission: import("../../Resource.ts").ResourceClass<IndicatorFeedPermission>;
/**
 * Returns true if the given value is an IndicatorFeedPermission resource.
 */
export declare const isIndicatorFeedPermission: (value: unknown) => value is IndicatorFeedPermission;
export declare const IndicatorFeedPermissionProvider: () => import("effect/Layer").Layer<Provider.Provider<IndicatorFeedPermission>, never, CloudflareEnvironment | intel.CloudflareOpContext>;
export {};
//# sourceMappingURL=IndicatorFeedPermission.d.ts.map