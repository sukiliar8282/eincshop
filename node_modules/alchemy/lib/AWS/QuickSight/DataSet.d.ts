import * as quicksight from "@distilled.cloud/aws/quicksight";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * Properties for an Amazon QuickSight dataset — a prepared, queryable model
 * built on top of one or more data sources.
 */
export interface DataSetProps {
    /**
     * Unique id of the dataset within the account. Stable — changing it
     * replaces the dataset. If omitted, a unique id is generated.
     */
    dataSetId?: string;
    /**
     * Display name of the dataset.
     */
    name: string;
    /**
     * Declares the physical tables in the dataset, keyed by a physical table
     * id. Each maps to a relational table, custom SQL, or an S3 source.
     */
    physicalTableMap: {
        [key: string]: quicksight.PhysicalTable | undefined;
    };
    /**
     * Whether the data is imported into SPICE or queried directly.
     */
    importMode: quicksight.DataSetImportMode;
    /**
     * Declares logical tables (joins, transforms) keyed by logical table id.
     */
    logicalTableMap?: {
        [key: string]: quicksight.LogicalTable | undefined;
    };
    /**
     * Column groupings (e.g. geospatial hierarchies).
     */
    columnGroups?: quicksight.ColumnGroup[];
    /**
     * Field folders that organize the dataset's fields.
     */
    fieldFolders?: {
        [key: string]: quicksight.FieldFolder | undefined;
    };
    /**
     * Resource-level permissions on the dataset.
     */
    permissions?: quicksight.ResourcePermission[];
    /**
     * Row-level permission configuration backed by a permissions dataset.
     */
    rowLevelPermissionDataSet?: quicksight.RowLevelPermissionDataSet;
    /**
     * Usage configuration controlling how the dataset can be used
     * (e.g. as a source for other datasets).
     */
    dataSetUsageConfiguration?: quicksight.DataSetUsageConfiguration;
    /**
     * Parameters exposed by the dataset.
     */
    datasetParameters?: quicksight.DatasetParameter[];
    /**
     * Tags to apply to the dataset.
     */
    tags?: Record<string, string>;
}
export interface DataSet extends Resource<"AWS.QuickSight.DataSet", DataSetProps, {
    /** Unique id of the dataset within the account. */
    dataSetId: string;
    /** ARN of the dataset. */
    arn: string;
    /** Display name of the dataset. */
    name: string;
}, never, Providers> {
}
/**
 * An Amazon QuickSight dataset — a prepared, queryable model built on top of
 * one or more data sources.
 *
 * QuickSight requires an active account subscription in the region. Without
 * one, create operations fail with the typed `QuickSightSubscriptionRequired`
 * error.
 *
 * ### Creating a Dataset
 * **Example:** SPICE Dataset from a Relational Table
 * ```typescript
 * const dataset = yield* DataSet("sales", {
 *   name: "Sales",
 *   importMode: "SPICE",
 *   physicalTableMap: {
 *     sales: {
 *       RelationalTable: {
 *         DataSourceArn: source.arn,
 *         Name: "sales",
 *         InputColumns: [{ Name: "amount", Type: "DECIMAL" }],
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const DataSet: import("../../Resource.ts").ResourceClass<DataSet>;
export declare const DataSetProvider: () => import("effect/Layer").Layer<Provider.Provider<DataSet>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DataSet.d.ts.map