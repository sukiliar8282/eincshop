import * as TSW from "@distilled.cloud/aws/timestream-write";
import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment, type AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type TableArn = `arn:aws:timestream:${RegionID}:${AccountID}:database/${string}/table/${string}`;
export type TableStatus = "ACTIVE" | "DELETING" | "RESTORING";
export interface TableRetentionProperties {
    /**
     * How long data stays in the memory store before moving to the magnetic
     * store. Rounded to whole hours on the wire
     * (`MemoryStoreRetentionPeriodInHours`).
     */
    memoryStoreRetention: Duration.Input;
    /**
     * How long data stays in the magnetic store before deletion. Rounded to
     * whole days on the wire (`MagneticStoreRetentionPeriodInDays`).
     */
    magneticStoreRetention: Duration.Input;
}
export interface TableProps {
    /**
     * Name of the database that owns this table. Pass the `databaseName` of a
     * {@link Database} resource.
     */
    databaseName: string;
    /**
     * Name of the table. Must be unique within the database and between 3 and
     * 256 characters.
     * @default ${app}-${stage}-${id}
     */
    tableName?: string;
    /**
     * Retention configuration for the table's memory and magnetic stores.
     * @default { memoryStoreRetention: "6 hours", magneticStoreRetention: "73000 days" }
     */
    retentionProperties?: TableRetentionProperties;
    /**
     * Magnetic store write configuration, including whether late-arriving data
     * is written to the magnetic store and where rejected records are logged.
     */
    magneticStoreWriteProperties?: TSW.MagneticStoreWriteProperties;
    /**
     * Partitioning schema for the table.
     */
    schema?: TSW.Schema;
    /**
     * Tags to associate with the table.
     */
    tags?: Record<string, string>;
}
export interface Table extends Resource<"AWS.Timestream.Table", TableProps, {
    /**
     * The table's physical name.
     */
    tableName: string;
    /**
     * Name of the database that owns the table.
     */
    databaseName: string;
    /**
     * ARN of the table.
     */
    tableArn: TableArn;
    /**
     * Current lifecycle status of the table.
     */
    tableStatus: TableStatus;
    /**
     * Effective retention configuration for the table.
     */
    retentionProperties: TSW.RetentionProperties | undefined;
    /**
     * Effective magnetic store write configuration.
     */
    magneticStoreWriteProperties: TSW.MagneticStoreWriteProperties | undefined;
    /**
     * Current tags reported for the table.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon Timestream for LiveAnalytics table — a time-series store inside a
 * {@link Database}.
 *
 * `Table` owns the table's lifecycle and its mutable configuration: memory and
 * magnetic store retention, magnetic store write behavior, and tags. A table
 * name is auto-generated from the app, stage, and logical ID unless you provide
 * one.
 *
 * :::note
 * Timestream for LiveAnalytics is closed to new AWS customers. Accounts that
 * were not already onboarded receive `TimestreamNotOnboarded` on every
 * operation.
 * :::
 * ### Creating Tables
 * **Example:** Basic Table
 * ```typescript
 * import * as Timestream from "alchemy/AWS/Timestream";
 *
 * const database = yield* Timestream.Database("Metrics");
 * const table = yield* Timestream.Table("Cpu", {
 *   databaseName: database.databaseName,
 * });
 * ```
 *
 * **Example:** Table with Retention Tuning
 * ```typescript
 * const table = yield* Timestream.Table("Cpu", {
 *   databaseName: database.databaseName,
 *   retentionProperties: {
 *     memoryStoreRetention: "24 hours",
 *     magneticStoreRetention: "365 days",
 *   },
 * });
 * ```
 *
 * ### Writing Points
 * **Example:** Write records from a handler
 * ```typescript
 * // init
 * const writeRecords = yield* Timestream.WriteRecords(table);
 *
 * return {
 *   fetch: Effect.gen(function* () {
 *     // runtime
 *     yield* writeRecords({
 *       Records: [
 *         {
 *           Dimensions: [{ Name: "host", Value: "web-1" }],
 *           MeasureName: "cpu",
 *           MeasureValue: "42.0",
 *           MeasureValueType: "DOUBLE",
 *           Time: `${Date.now()}`,
 *           TimeUnit: "MILLISECONDS",
 *         },
 *       ],
 *     });
 *     return HttpServerResponse.text("ok");
 *   }),
 * };
 * ```
 *
 * @resource
 */
export declare const Table: import("../../Resource.ts").ResourceClass<Table>;
export declare const TableProvider: () => import("effect/Layer").Layer<Provider.Provider<Table>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Table.d.ts.map