import * as web3 from "@distilled.cloud/cloudflare/web3";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Web3.HostnameContentList";
type TypeId = typeof TypeId;
/**
 * The kind of content a content-list entry blocks: a CID (`cid`) or a
 * content path (`content_path`).
 */
export type ContentListEntryType = "cid" | "content_path";
/**
 * A single entry of an IPFS universal-path content list.
 */
export interface ContentListEntry {
    /**
     * The CID or content path of content to block, e.g.
     * `QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco` (`cid`) or
     * `/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/wiki` (`content_path`).
     */
    content: string;
    /**
     * The type of content list entry to block.
     */
    type: ContentListEntryType;
    /**
     * An optional description of the content list entry.
     */
    description?: string;
}
export interface HostnameContentListProps {
    /**
     * The zone the hostname belongs to.
     *
     * Stable — moving to another zone triggers a replacement.
     */
    zoneId: string;
    /**
     * The Web3 hostname the content list belongs to. Must be an
     * `ipfs_universal_path` hostname — other targets reject content-list
     * operations.
     *
     * Stable — pointing at another hostname triggers a replacement.
     */
    hostnameId: string;
    /**
     * Behavior of the content list. Cloudflare currently only supports
     * `block`.
     * @default "block"
     */
    action?: "block";
    /**
     * The full desired set of content list entries. The list is replaced
     * declaratively on every change (bulk PUT) — entries not present here
     * are removed.
     * @default []
     */
    entries?: ContentListEntry[];
}
export interface HostnameContentListAttributes {
    /** The zone the hostname belongs to. */
    zoneId: string;
    /** The Web3 hostname the content list belongs to. */
    hostnameId: string;
    /** Behavior of the content list. */
    action: "block";
    /** The current content list entries. */
    entries: ContentListEntry[];
}
export type HostnameContentList = Resource<TypeId, HostnameContentListProps, HostnameContentListAttributes, never, Providers>;
/**
 * The IPFS content-blocking list of a Web3 universal-path gateway hostname —
 * blocks specific CIDs or content paths from being served.
 *
 * The content list is a per-hostname singleton: it always exists for an
 * `ipfs_universal_path` hostname (empty by default), so this resource never
 * creates or deletes a physical object. Reconciliation replaces the whole
 * list declaratively via the bulk PUT, and destroy resets the list to empty.
 * ### Blocking content
 * **Example:** Block a CID and a content path
 * ```typescript
 * const gateway = yield* Cloudflare.Web3.Hostname("UniversalGateway", {
 *   zoneId: zone.zoneId,
 *   name: "gateway.example.com",
 *   target: "ipfs_universal_path",
 * });
 *
 * yield* Cloudflare.Web3.HostnameContentList("Blocklist", {
 *   zoneId: zone.zoneId,
 *   hostnameId: gateway.hostnameId,
 *   entries: [
 *     {
 *       type: "cid",
 *       content: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
 *       description: "blocked CID",
 *     },
 *     {
 *       type: "content_path",
 *       content: "/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/wiki",
 *     },
 *   ],
 * });
 * ```
 *
 * **Example:** Clear the blocklist
 * ```typescript
 * // An empty entries array removes every block (also what destroy does).
 * yield* Cloudflare.Web3.HostnameContentList("Blocklist", {
 *   zoneId: zone.zoneId,
 *   hostnameId: gateway.hostnameId,
 *   entries: [],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/web3/
 *
 * @resource
 * @product Web3
 * @category Domains & DNS
 */
export declare const HostnameContentList: import("../../Resource.ts").ResourceClass<HostnameContentList>;
/**
 * Returns true if the given value is a HostnameContentList resource.
 */
export declare const isHostnameContentList: (value: unknown) => value is HostnameContentList;
export declare const HostnameContentListProvider: () => import("effect/Layer").Layer<Provider.Provider<HostnameContentList>, never, CloudflareEnvironment | web3.CloudflareOpContext>;
export {};
//# sourceMappingURL=ContentList.d.ts.map