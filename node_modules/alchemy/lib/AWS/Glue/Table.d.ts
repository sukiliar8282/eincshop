import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface GlueColumn {
    /** Column name. */
    name: string;
    /** Column data type (Hive/Glue type string, e.g. `string`, `bigint`). */
    type?: string;
    /** Free-text comment. */
    comment?: string;
    /** Free-form key/value properties for the column. */
    parameters?: Record<string, string>;
}
export interface GlueSerDeInfo {
    /** Name of the SerDe. */
    name?: string;
    /**
     * The serialization library class, e.g.
     * `org.apache.hadoop.hive.ql.io.parquet.serde.ParquetHiveSerDe`.
     */
    serializationLibrary?: string;
    /** SerDe configuration properties. */
    parameters?: Record<string, string>;
}
export interface GlueStorageDescriptor {
    /** Columns of the table (schema). */
    columns?: GlueColumn[];
    /** Physical location of the data (usually an S3 path). */
    location?: string;
    /**
     * The input format class, e.g.
     * `org.apache.hadoop.hive.ql.io.parquet.MapredParquetInputFormat`.
     */
    inputFormat?: string;
    /**
     * The output format class, e.g.
     * `org.apache.hadoop.hive.ql.io.parquet.MapredParquetOutputFormat`.
     */
    outputFormat?: string;
    /** Whether the data is compressed. */
    compressed?: boolean;
    /** Number of buckets used to bucket the table (if `bucketColumns` is set). */
    numberOfBuckets?: number;
    /** Serialization/deserialization metadata. */
    serdeInfo?: GlueSerDeInfo;
    /** Columns the table is bucketed by. */
    bucketColumns?: string[];
    /** Free-form storage descriptor properties. */
    parameters?: Record<string, string>;
    /** Whether the table stores data in subdirectories. */
    storedAsSubDirectories?: boolean;
}
export interface TableProps {
    /**
     * Name of the database the table belongs to. Changing it replaces the
     * table.
     */
    databaseName: string;
    /**
     * Name of the table. Glue lowercases table names. If omitted, a unique
     * lowercase name is generated. Changing the name replaces the table.
     * @default a generated lowercase physical name
     */
    tableName?: string;
    /**
     * A description of the table.
     */
    description?: string;
    /**
     * The table owner.
     */
    owner?: string;
    /**
     * The type of the table. Common values are `EXTERNAL_TABLE`,
     * `GOVERNED`, and `VIRTUAL_VIEW`.
     * @default "EXTERNAL_TABLE"
     */
    tableType?: string;
    /**
     * Retention time (in days) for the table.
     */
    retention?: number;
    /**
     * The physical storage descriptor: columns (schema), data location, input/
     * output formats, and SerDe. This is what Athena reads to query the data.
     */
    storageDescriptor?: GlueStorageDescriptor;
    /**
     * Partition keys. Athena prunes partitions on these columns. Note: changing
     * partition keys after creation requires `Force`; Alchemy sends the desired
     * set on every update.
     */
    partitionKeys?: GlueColumn[];
    /**
     * Free-form key/value properties stored on the table. Alchemy adds its own
     * `alchemy::*` ownership markers here (Glue tables are not ARN-taggable) —
     * user keys are preserved.
     */
    parameters?: Record<string, string>;
    /**
     * The AWS account ID of the Data Catalog. Changing it replaces the table.
     * @default the caller's account (the default Data Catalog)
     */
    catalogId?: string;
}
export interface Table extends Resource<"AWS.Glue.Table", TableProps, {
    /** The (lowercase) name of the table. */
    tableName: string;
    /** The name of the database the table belongs to. */
    databaseName: string;
    /** The ARN of the table. */
    tableArn: string;
    /** The AWS account ID of the Data Catalog the table lives in. */
    catalogId: string;
}, {}, Providers> {
}
/**
 * An AWS Glue Data Catalog table — a schema (columns), storage location, and
 * SerDe over data in S3 (or another store). This is the unit Athena, Redshift
 * Spectrum, and EMR query; it is the analytics foundation of a Glue database.
 * ### Creating Tables
 * **Example:** Parquet Table over S3
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const database = yield* AWS.Glue.Database("Analytics", {
 *   databaseName: "analytics",
 * });
 *
 * const events = yield* AWS.Glue.Table("Events", {
 *   databaseName: database.databaseName,
 *   tableName: "events",
 *   tableType: "EXTERNAL_TABLE",
 *   storageDescriptor: {
 *     location: "s3://my-data-lake/events/",
 *     inputFormat:
 *       "org.apache.hadoop.hive.ql.io.parquet.MapredParquetInputFormat",
 *     outputFormat:
 *       "org.apache.hadoop.hive.ql.io.parquet.MapredParquetOutputFormat",
 *     serdeInfo: {
 *       serializationLibrary:
 *         "org.apache.hadoop.hive.ql.io.parquet.serde.ParquetHiveSerDe",
 *     },
 *     columns: [
 *       { name: "id", type: "string" },
 *       { name: "amount", type: "double" },
 *     ],
 *   },
 *   partitionKeys: [{ name: "dt", type: "string" }],
 *   parameters: { classification: "parquet" },
 * });
 * ```
 *
 * @resource
 */
export declare const Table: import("../../Resource.ts").ResourceClass<Table>;
export declare const TableProvider: () => import("effect/Layer").Layer<Provider.Provider<Table>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Table.d.ts.map