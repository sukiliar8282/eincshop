import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * A Cassandra column definition. `type` is a CQL data type such as `text`,
 * `int`, `uuid`, `timestamp`, `blob`, or a collection like `list<text>`.
 */
export interface KeyspacesColumn {
    /** Column name. */
    name: string;
    /** CQL data type, e.g. `text`, `int`, `uuid`. */
    type: string;
}
/**
 * A clustering key column and its sort order.
 */
export interface KeyspacesClusteringKey {
    /** Name of a column also present in `columns`. */
    name: string;
    /**
     * Sort order for the clustering key.
     * @default "ASC"
     */
    orderBy?: "ASC" | "DESC";
}
/**
 * Read/write throughput mode for a table.
 */
export interface KeyspacesCapacity {
    /**
     * Billing mode.
     * @default "PAY_PER_REQUEST"
     */
    throughputMode: "PAY_PER_REQUEST" | "PROVISIONED";
    /** Provisioned read capacity units (only for `PROVISIONED`). */
    readCapacityUnits?: number;
    /** Provisioned write capacity units (only for `PROVISIONED`). */
    writeCapacityUnits?: number;
}
/**
 * Change data capture (CDC) stream configuration for a table.
 */
export interface KeyspacesCdcSpecification {
    /**
     * Whether CDC is enabled on the table.
     */
    status: "ENABLED" | "DISABLED";
    /**
     * What data is written to the table's stream for each changed row.
     * @default "NEW_AND_OLD_IMAGES"
     */
    viewType?: "NEW_IMAGE" | "OLD_IMAGE" | "KEYS_ONLY" | "NEW_AND_OLD_IMAGES";
}
export interface TableProps {
    /**
     * Name of the parent keyspace. Changing it replaces the table.
     */
    keyspaceName: string;
    /**
     * Name of the table. Must be 1-48 characters of `[a-zA-Z0-9_]`. If omitted a
     * deterministic physical name is generated. Changing the name replaces the
     * table.
     */
    tableName?: string;
    /**
     * All columns in the table, including those used as partition and clustering
     * keys. Adding new columns is applied in place; removing or retyping columns
     * replaces the table.
     */
    columns: KeyspacesColumn[];
    /**
     * Names of the columns forming the partition key (at least one). Changing
     * the partition key replaces the table.
     */
    partitionKeys: string[];
    /**
     * Columns forming the clustering (sort) key. Changing them replaces the
     * table.
     */
    clusteringKeys?: KeyspacesClusteringKey[];
    /**
     * Names of static columns (shared across all rows of a partition).
     */
    staticColumns?: string[];
    /**
     * Read/write throughput mode.
     * @default { throughputMode: "PAY_PER_REQUEST" }
     */
    capacity?: KeyspacesCapacity;
    /**
     * Enables point-in-time recovery (continuous backups).
     * @default false
     */
    pointInTimeRecovery?: boolean;
    /**
     * Enables row-level TTL on the table. Required before per-row TTLs can be
     * set. Enabling TTL cannot be undone without replacing the table.
     * @default false
     */
    ttlEnabled?: boolean;
    /**
     * Default TTL applied to all rows, e.g. `"1 day"` or `Duration.hours(12)`.
     * The API stores whole seconds. Requires `ttlEnabled`.
     */
    defaultTimeToLive?: Duration.Input;
    /**
     * Change data capture (CDC) stream configuration. Enabling CDC creates a
     * stream that captures row-level changes for 24 hours; consume it with the
     * `TableStreams` binding or the `keyspacesstreams` data-plane API.
     */
    cdcSpecification?: KeyspacesCdcSpecification;
    /**
     * User-defined tags for the table.
     */
    tags?: Record<string, string>;
}
export interface Table extends Resource<"AWS.Keyspaces.Table", TableProps, {
    /**
     * Name of the keyspace containing the table.
     */
    keyspaceName: string;
    /**
     * The table's physical name.
     */
    tableName: string;
    /**
     * ARN of the table.
     */
    tableArn: string;
    /**
     * Lifecycle status of the table (e.g. `CREATING`, `ACTIVE`).
     */
    status: string;
    /**
     * ARN of the most recent CDC stream, when `cdcSpecification` is enabled.
     */
    latestStreamArn: string | undefined;
}, never, Providers> {
}
/**
 * An Amazon Keyspaces (for Apache Cassandra) table.
 *
 * Tables are serverless and provisioned asynchronously (`CREATING` ->
 * `ACTIVE`), usually within a minute; the provider waits for `ACTIVE`
 * (bounded) before returning. Schema mutations (adding columns, changing
 * capacity/TTL/PITR) are applied in place; changing keys replaces the table.
 * ### Creating a Table
 * **Example:** Simple Key-Value Table
 * ```typescript
 * const table = yield* Table("Sessions", {
 *   keyspaceName: keyspace.keyspaceName,
 *   columns: [
 *     { name: "id", type: "uuid" },
 *     { name: "data", type: "text" },
 *   ],
 *   partitionKeys: ["id"],
 * });
 * ```
 *
 * **Example:** Table with a Clustering Key and TTL
 * ```typescript
 * const table = yield* Table("Events", {
 *   keyspaceName: keyspace.keyspaceName,
 *   columns: [
 *     { name: "device", type: "text" },
 *     { name: "ts", type: "timestamp" },
 *     { name: "payload", type: "blob" },
 *   ],
 *   partitionKeys: ["device"],
 *   clusteringKeys: [{ name: "ts", orderBy: "DESC" }],
 *   ttlEnabled: true,
 *   defaultTimeToLive: "1 day",
 * });
 * ```
 *
 * ### Change Data Capture
 * **Example:** CDC-Enabled Table
 * ```typescript
 * const table = yield* Table("Orders", {
 *   keyspaceName: keyspace.keyspaceName,
 *   columns: [
 *     { name: "id", type: "uuid" },
 *     { name: "total", type: "int" },
 *   ],
 *   partitionKeys: ["id"],
 *   cdcSpecification: {
 *     status: "ENABLED",
 *     viewType: "NEW_AND_OLD_IMAGES",
 *   },
 * });
 * // table.latestStreamArn → consume via the TableStreams binding
 * ```
 *
 * @resource
 */
export declare const Table: import("../../Resource.ts").ResourceClass<Table>;
export declare const TableProvider: () => import("effect/Layer").Layer<Provider.Provider<Table>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Table.d.ts.map