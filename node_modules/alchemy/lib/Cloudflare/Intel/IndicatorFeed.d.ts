import * as intel from "@distilled.cloud/cloudflare/intel";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Intel.IndicatorFeed";
type TypeId = typeof TypeId;
export interface IndicatorFeedProps {
    /**
     * The name of the indicator feed. Not unique on Cloudflare's side, but
     * used as the cold-state recovery identity, so keep it unique within the
     * account. If omitted, a unique name is generated from the app, stage,
     * and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Human-readable description of the feed.
     */
    description?: string;
    /**
     * Whether the indicator feed can be attributed to a provider (consumers
     * see who published it).
     * @default false
     */
    isAttributable?: boolean;
    /**
     * Whether the indicator feed data can be downloaded by consumers.
     * @default false
     */
    isDownloadable?: boolean;
    /**
     * Whether the indicator feed is exposed to customers (publicly listed).
     * @default false
     */
    isPublic?: boolean;
    /**
     * Inline STIX 2.x content for the feed's snapshot. When provided, the
     * content is uploaded via the snapshot endpoint whenever it changes
     * (tracked by content hash). Cloudflare processes uploads asynchronously
     * — see the `latestUploadStatus` attribute.
     */
    snapshot?: string;
}
export interface IndicatorFeedAttributes {
    /** The server-assigned numeric identifier for the indicator feed. */
    feedId: number;
    /** The Cloudflare account the feed belongs to. */
    accountId: string;
    /** The name of the indicator feed. */
    name: string;
    /** The description of the indicator feed. */
    description: string | undefined;
    /** Whether the feed can be attributed to a provider. */
    isAttributable: boolean;
    /** Whether the feed data can be downloaded by consumers. */
    isDownloadable: boolean;
    /** Whether the feed is exposed to customers. */
    isPublic: boolean;
    /** When the feed was created. */
    createdOn: string | undefined;
    /** When the feed was last modified. */
    modifiedOn: string | undefined;
    /**
     * Status of the latest snapshot upload (`Mirroring`, `Unifying`,
     * `Loading`, `Provisioning`, `Complete`, or `Error`), if any.
     */
    latestUploadStatus: string | undefined;
    /**
     * SHA-256 hash of the last snapshot content uploaded by this provider.
     * Used to skip re-uploading unchanged content.
     */
    snapshotHash: string | undefined;
}
export type IndicatorFeed = Resource<TypeId, IndicatorFeedProps, IndicatorFeedAttributes, never, Providers>;
/**
 * A Cloudflare custom Indicator Feed (Cloudforce One threat intelligence).
 *
 * Indicator feeds let approved accounts publish their own threat-intel
 * indicators (domains, IPs, URLs) that consumer accounts can subscribe to
 * via Gateway or download directly. Creating feeds requires the account to
 * be approved as a feed provider (a Cloudforce One entitlement) — without
 * it, creation fails with the typed `IndicatorFeedsNotEntitled` error.
 *
 * :::warning
 * Cloudflare's API exposes **no delete endpoint** for indicator feeds.
 * Destroying this resource orphans the feed on Cloudflare's side (a warning
 * is logged). To avoid leaking feeds across deployments, the provider
 * adopts an existing feed with the same name instead of creating a
 * duplicate.
 * :::
 * ### Creating a Feed
 * **Example:** Basic feed
 * ```typescript
 * const feed = yield* Cloudflare.Intel.IndicatorFeed("threat-feed", {
 *   description: "Indicators observed by our honeypots",
 * });
 * ```
 *
 * **Example:** Public, downloadable feed
 * ```typescript
 * const feed = yield* Cloudflare.Intel.IndicatorFeed("public-feed", {
 *   name: "acme-public-indicators",
 *   description: "Acme Corp public threat indicators",
 *   isPublic: true,
 *   isDownloadable: true,
 *   isAttributable: true,
 * });
 * ```
 *
 * ### Publishing Indicators
 * **Example:** Upload a STIX 2.x snapshot inline
 * ```typescript
 * const feed = yield* Cloudflare.Intel.IndicatorFeed("threat-feed", {
 *   description: "Indicators observed by our honeypots",
 *   snapshot: JSON.stringify({
 *     type: "bundle",
 *     id: "bundle--0a242344-3c0b-4fdb-9f59-3e8c4a4f6b3a",
 *     objects: [],
 *   }),
 * });
 * ```
 *
 * ### Sharing a Feed
 * **Example:** Grant another account access
 * ```typescript
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
export declare const IndicatorFeed: import("../../Resource.ts").ResourceClass<IndicatorFeed>;
/**
 * Returns true if the given value is an IndicatorFeed resource.
 */
export declare const isIndicatorFeed: (value: unknown) => value is IndicatorFeed;
export declare const IndicatorFeedProvider: () => import("effect/Layer").Layer<Provider.Provider<IndicatorFeed>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | intel.CloudflareOpContext>;
export {};
//# sourceMappingURL=IndicatorFeed.d.ts.map