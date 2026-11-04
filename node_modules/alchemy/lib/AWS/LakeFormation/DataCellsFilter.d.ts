import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * Row-level filter condition for a {@link DataCellsFilter}.
 */
export interface RowFilterSpec {
    /**
     * PartiQL predicate selecting the visible rows (e.g.
     * `country = 'US'`). Mutually exclusive with `allRows`.
     */
    filterExpression?: string;
    /**
     * When true, all rows are visible (column-level filtering only).
     * @default true when `filterExpression` is omitted
     */
    allRows?: boolean;
}
export interface DataCellsFilterProps {
    /**
     * Name of the filter (unique per table). If omitted, a unique name is
     * generated from the app, stage, and logical id. Changing it replaces the
     * filter.
     */
    name?: string;
    /**
     * Name of the Glue database that contains the table. Changing it replaces
     * the filter.
     */
    databaseName: string;
    /**
     * Name of the Glue table the filter applies to. Changing it replaces the
     * filter.
     */
    tableName: string;
    /**
     * The catalog id (AWS account id) the table lives in. Changing it
     * replaces the filter.
     * @default the caller's account
     */
    tableCatalogId?: string;
    /**
     * Row-level filter. Defaults to all rows.
     */
    rowFilter?: RowFilterSpec;
    /**
     * Include-list of visible column names. Mutually exclusive with
     * `excludedColumnNames`.
     */
    columnNames?: string[];
    /**
     * Exclude-list of column names (a column wildcard excluding these
     * columns). Mutually exclusive with `columnNames`.
     */
    excludedColumnNames?: string[];
}
export interface DataCellsFilter extends Resource<"AWS.LakeFormation.DataCellsFilter", DataCellsFilterProps, {
    name: string;
    databaseName: string;
    tableName: string;
    tableCatalogId: string;
    versionId: string | undefined;
}, {}, Providers> {
}
/**
 * A Lake Formation data cells filter — row- and column-level security on a
 * Glue table. Grant `SELECT` on the filter (via
 * `Resource.DataCellsFilter`) to give principals access to only the
 * filtered cells.
 *
 * Creating filters requires `SELECT` with the grant option on the table (or
 * data lake administrator) — see
 * {@link DataLakeSettings | AWS.LakeFormation.DataLakeSettings}.
 *
 * ### Creating Data Cells Filters
 * **Example:** Column Filter Hiding PII
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const filter = yield* AWS.LakeFormation.DataCellsFilter("NoPii", {
 *   databaseName: database.databaseName,
 *   tableName: table.tableName,
 *   excludedColumnNames: ["email", "ssn"],
 * });
 * ```
 *
 * **Example:** Row Filter by Country
 * ```typescript
 * const filter = yield* AWS.LakeFormation.DataCellsFilter("UsOnly", {
 *   databaseName: database.databaseName,
 *   tableName: table.tableName,
 *   rowFilter: { filterExpression: "country = 'US'" },
 * });
 * ```
 *
 * @resource
 */
export declare const DataCellsFilter: import("../../Resource.ts").ResourceClass<DataCellsFilter>;
export declare const DataCellsFilterProvider: () => import("effect/Layer").Layer<Provider.Provider<DataCellsFilter>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DataCellsFilter.d.ts.map