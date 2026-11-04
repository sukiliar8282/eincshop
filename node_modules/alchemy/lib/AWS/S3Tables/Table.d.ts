import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { TableBucketArn } from "./TableBucket.ts";
/**
 * A field in an Apache Iceberg table schema.
 */
export interface IcebergSchemaField {
    /**
     * Name of the field.
     */
    name: string;
    /**
     * Iceberg field type, e.g. `int`, `long`, `string`, `boolean`,
     * `timestamp`, `date`, `decimal(10,2)`.
     */
    type: string;
    /**
     * Whether the field is required (non-nullable).
     * @default false
     */
    required?: boolean;
}
export interface TableProps {
    /**
     * ARN of the table bucket that owns the table. Changing it replaces the
     * table.
     */
    tableBucket: TableBucketArn | string;
    /**
     * Name of the namespace that owns the table. Changing it replaces the
     * table.
     */
    namespace: string;
    /**
     * Name of the table. Must be 1-255 characters of lowercase letters,
     * numbers, and underscores, beginning with a letter or number. Changing
     * the name replaces the table.
     * @default a deterministic name derived from the app, stage, and logical ID
     */
    name?: string;
    /**
     * Open table format. Only `ICEBERG` is supported.
     * @default "ICEBERG"
     */
    format?: "ICEBERG";
    /**
     * Iceberg schema for the table, applied at create time. Schema evolution
     * after creation is a data-plane concern; changing this replaces the
     * table.
     */
    schema?: {
        /**
         * Ordered list of schema fields.
         */
        fields: IcebergSchemaField[];
    };
}
export interface Table extends Resource<"AWS.S3Tables.Table", TableProps, {
    tableArn: string;
    name: string;
    namespace: string;
    tableBucketArn: string;
    versionToken: string;
    metadataLocation: string | undefined;
    warehouseLocation: string;
    format: string;
    type: string;
    createdAt: Date;
}, never, Providers> {
}
/**
 * A fully-managed Apache Iceberg table within an S3 Tables {@link Namespace}.
 *
 * S3 Tables manages the table's storage, metadata, and maintenance
 * (compaction, snapshot expiration). Query it through engines like Amazon
 * Athena, Amazon EMR, or Apache Spark via the S3 Tables Iceberg catalog.
 * ### Creating Tables
 * **Example:** Table with an Iceberg schema
 * ```typescript
 * import * as S3Tables from "alchemy/AWS/S3Tables";
 *
 * const bucket = yield* S3Tables.TableBucket("Analytics");
 * const ns = yield* S3Tables.Namespace("Events", {
 *   tableBucket: bucket.tableBucketArn,
 * });
 * const table = yield* S3Tables.Table("PageViews", {
 *   tableBucket: bucket.tableBucketArn,
 *   namespace: ns.namespace,
 *   schema: {
 *     fields: [
 *       { name: "id", type: "long", required: true },
 *       { name: "url", type: "string" },
 *       { name: "ts", type: "timestamp" },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Table: import("../../Resource.ts").ResourceClass<Table>;
export declare const TableProvider: () => import("effect/Layer").Layer<Provider.Provider<Table>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Table.d.ts.map