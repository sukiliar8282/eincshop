import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * The type of a Resource Explorer index.
 *
 * - `LOCAL` — indexes resources in its own region only.
 * - `AGGREGATOR` — additionally replicates resource information from every
 *   other region's local index, enabling account-wide search from this
 *   region. Only one aggregator index may exist per account.
 */
export type IndexType = "LOCAL" | "AGGREGATOR";
export interface IndexProps {
    /**
     * The index type. Promote to `AGGREGATOR` to enable cross-region search
     * from this region; demote back to `LOCAL` to stop replication. Note
     * that after demoting an aggregator index AWS enforces a 24-hour wait
     * before another index can be promoted.
     * @default "LOCAL"
     */
    type?: IndexType;
    /**
     * Tags to apply to the index. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
/** @resource */
export interface Index extends Resource<"AWS.ResourceExplorer.Index", IndexProps, {
    /** ARN of the index, e.g. `arn:aws:resource-explorer-2:us-west-2:123456789012:index/uuid`. */
    indexArn: string;
    /** The current index type (`LOCAL` or `AGGREGATOR`). */
    indexType: string;
    /** Lifecycle state of the index (`CREATING`, `ACTIVE`, `UPDATING`, ...). */
    indexState: string;
}, never, Providers> {
}
/**
 * An AWS Resource Explorer index — the region singleton that turns on
 * resource indexing so resources in the region can be searched.
 *
 * Only one index can exist per region, so this is a capture-and-restore
 * singleton: adopting an index that Alchemy did not create requires
 * `--adopt` (ownership is tracked through the index's tags), and destroy
 * turns Resource Explorer off for the region (deleting every view in it).
 *
 * The first index created in an account also creates the
 * `AWSServiceRoleForResourceExplorer` service-linked role.
 *
 * ### Turning on Resource Explorer
 * **Example:** Local index
 * ```typescript
 * const index = yield* AWS.ResourceExplorer.Index("Index", {});
 * ```
 *
 * **Example:** Aggregator index for cross-region search
 * ```typescript
 * const index = yield* AWS.ResourceExplorer.Index("Index", {
 *   type: "AGGREGATOR",
 * });
 * ```
 *
 * ### Searching
 * Search always goes through a view — see `AWS.ResourceExplorer.View` and
 * the `AWS.ResourceExplorer.Search` binding.
 */
declare const IndexResource: import("../../Resource.ts").ResourceClass<Index>;
export { IndexResource as Index };
export declare const IndexProvider: () => import("effect/Layer").Layer<Provider.Provider<Index>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ExplorerIndex.d.ts.map