import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * The type of assets a data set can hold. Immutable — changing it replaces
 * the data set.
 */
export type DataSetAssetType = "S3_SNAPSHOT" | "REDSHIFT_DATA_SHARE" | "API_GATEWAY_API" | "S3_DATA_ACCESS" | "LAKE_FORMATION_DATA_PERMISSION";
export interface DataSetProps {
    /**
     * Name of the data set. If omitted, a unique name is generated from the
     * app, stage, and logical ID. The name is mutable — changing it updates the
     * data set in place.
     */
    name?: string;
    /**
     * The type of assets the data set holds. `S3_SNAPSHOT` (static files
     * snapshotted from S3) is the most common.
     * Immutable — changing it replaces the data set.
     * @default "S3_SNAPSHOT"
     */
    assetType?: DataSetAssetType;
    /**
     * A description of the data set, shown to subscribers on AWS Data Exchange.
     * @default the data set name
     */
    description?: string;
    /**
     * Tags to apply to the data set. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface DataSet extends Resource<"AWS.DataExchange.DataSet", DataSetProps, {
    /**
     * The unique identifier of the data set.
     */
    dataSetId: string;
    /**
     * The ARN of the data set.
     */
    dataSetArn: string;
    /**
     * The name of the data set.
     */
    name: string;
    /**
     * The type of assets the data set holds.
     */
    assetType: string;
    /**
     * The origin of the data set — `OWNED` for data sets created by this
     * account, `ENTITLED` for data sets obtained through a subscription.
     */
    origin: string;
}, never, Providers> {
}
/**
 * An AWS Data Exchange data set — the top-level container that data providers
 * publish revisions of data into. An owned data set holds revisions, each of
 * which holds assets (e.g. S3 snapshot files) that subscribers receive.
 *
 * ### Creating Data Sets
 * **Example:** Basic S3-snapshot data set
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const dataSet = yield* AWS.DataExchange.DataSet("Prices", {
 *   description: "Daily commodity price snapshots",
 * });
 * ```
 *
 * **Example:** Named data set with tags
 * ```typescript
 * const dataSet = yield* AWS.DataExchange.DataSet("Prices", {
 *   name: "commodity-prices",
 *   assetType: "S3_SNAPSHOT",
 *   description: "Daily commodity price snapshots",
 *   tags: { team: "data" },
 * });
 * ```
 *
 * ### Publishing Revisions
 * **Example:** Add a revision to a data set
 * ```typescript
 * const revision = yield* AWS.DataExchange.Revision("PricesV1", {
 *   dataSetId: dataSet.dataSetId,
 *   comment: "Initial snapshot",
 * });
 * ```
 *
 * @resource
 */
export declare const DataSet: import("../../Resource.ts").ResourceClass<DataSet>;
export declare const DataSetProvider: () => import("effect/Layer").Layer<Provider.Provider<DataSet>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DataSet.d.ts.map