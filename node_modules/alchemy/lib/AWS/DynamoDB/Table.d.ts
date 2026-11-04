import type * as DynamoDB from "@distilled.cloud/aws/dynamodb";
import type * as lambda from "aws-lambda";
import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type TableName = string;
export type TableArn = `arn:aws:dynamodb:${RegionID}:${AccountID}:table/${TableName}`;
export type TableRecord<Data> = Omit<lambda.DynamoDBRecord, "dynamodb"> & {
    dynamodb: Omit<lambda.StreamRecord, "NewImage" | "OldImage"> & {
        NewImage?: Data;
        OldImage?: Data;
    };
};
export type TableEvent<Data> = Omit<lambda.DynamoDBStreamEvent, "Records"> & {
    Records: TableRecord<Data>[];
};
export type ScalarAttributeType = "S" | "N" | "B";
export interface PointInTimeRecoverySpecification {
    /**
     * Whether point-in-time recovery (continuous backups) is enabled for the
     * table.
     */
    pointInTimeRecoveryEnabled: boolean;
    /**
     * How far back the table can be restored, e.g. `"7 days"` or
     * `Duration.days(7)`. Rounded to whole days on the wire (1–35 days).
     * @default 35 days
     */
    recoveryPeriod?: Duration.Input;
}
export interface KinesisStreamingDestination {
    /**
     * ARN of the destination Kinesis Data Stream. The stream must be ACTIVE
     * when the destination is enabled (deploy the `AWS.Kinesis.Stream`
     * resource in the same stack and pass `stream.streamArn`).
     */
    streamArn: string;
    /**
     * Precision of the approximate creation timestamp stamped on records
     * delivered to the Kinesis stream. Changing this on an ACTIVE destination
     * updates it in place, but the UPDATING→ACTIVE transition can take several
     * minutes.
     * @default "MILLISECOND"
     */
    approximateCreationDateTimePrecision?: DynamoDB.ApproximateCreationDateTimePrecision;
}
/**
 * One or more attribute names forming an index key. DynamoDB's wire format
 * flattens both key segments into a single ordered `KeySchema` list, but
 * semantically a key is two ordered segments — this type captures one of
 * them. Order is significant: partition attributes are hashed together in
 * declaration order, and sort attributes are queried left-to-right.
 */
export type IndexKey = string | string[];
export interface LocalSecondaryIndexProps {
    /**
     * Name of the index, unique within the table.
     */
    indexName: string;
    /**
     * Sort key attribute name. An LSI always shares the table's partition
     * key, so only the sort key is declared; multi-attribute keys are not
     * supported on LSIs.
     */
    sortKey: string;
    /**
     * Attributes projected from the table into the index.
     */
    projection: DynamoDB.Projection;
}
export interface GlobalSecondaryIndexProps {
    /**
     * Name of the index, unique within the table.
     */
    indexName: string;
    /**
     * Partition key attribute name(s). Up to four attributes may be listed;
     * they are hashed together in declaration order and every one must be
     * specified with an equality condition when querying the index.
     */
    partitionKey: IndexKey;
    /**
     * Optional sort key attribute name(s). Up to four attributes may be
     * listed; items sort by each attribute in declaration order and queries
     * narrow them left-to-right (no gaps, inequality last).
     */
    sortKey?: IndexKey;
    /**
     * Attributes projected from the table into the index.
     */
    projection: DynamoDB.Projection;
    provisionedThroughput?: DynamoDB.ProvisionedThroughput;
    onDemandThroughput?: DynamoDB.OnDemandThroughput;
    warmThroughput?: DynamoDB.WarmThroughput;
}
export type TableProps = {
    /**
     * Name of the table. If omitted, Alchemy generates a deterministic physical
     * name from the stack, stage, and logical ID, suffixed with the instance ID
     * so replacements can create the successor table before deleting the old one.
     *
     * Changing this property replaces the table. If the name is hard-coded,
     * replacement-triggering changes (key schema, attribute types, LSIs, GSI
     * key changes) delete the old table first and then recreate it under the
     * same name, since DynamoDB table names are unique per account/region.
     */
    tableName?: string;
    /**
     * Partition key attribute name for the table.
     *
     * Base-table primary keys are always a single partition attribute plus an
     * optional single sort attribute — DynamoDB supports multi-attribute keys
     * only on global secondary indexes (see `globalSecondaryIndexes`).
     */
    partitionKey: string;
    /**
     * Optional sort key attribute name for the table.
     */
    sortKey?: string;
    /**
     * Attribute definitions used by the primary key and any secondary indexes.
     */
    attributes: Record<string, ScalarAttributeType>;
    /**
     * Local secondary indexes, created with the table. An LSI always shares
     * the table's partition key and declares a single sort key. Changing this
     * property replaces the table.
     */
    localSecondaryIndexes?: LocalSecondaryIndexProps[];
    /**
     * Global secondary indexes. GSIs support multi-attribute keys: up to four
     * partition attributes (hashed together as the composite partition key)
     * and up to four sort attributes (sorted and queried left-to-right).
     * Attribute order is significant — reordering defines a different index
     * and replaces the table. Every key attribute must appear in `attributes`.
     */
    globalSecondaryIndexes?: GlobalSecondaryIndexProps[];
    billingMode?: DynamoDB.BillingMode;
    deletionProtectionEnabled?: boolean;
    onDemandThroughput?: DynamoDB.OnDemandThroughput;
    /**
     * Enables point-in-time recovery (continuous backups) and optionally sets
     * the recovery window via `recoveryPeriod` (a `Duration.Input`, rounded to
     * whole days on the wire).
     */
    pointInTimeRecoverySpecification?: PointInTimeRecoverySpecification;
    provisionedThroughput?: DynamoDB.ProvisionedThroughput;
    sseSpecification?: DynamoDB.SSESpecification;
    tags?: Record<string, string>;
    timeToLiveSpecification?: DynamoDB.TimeToLiveSpecification;
    warmThroughput?: DynamoDB.WarmThroughput;
    tableClass?: DynamoDB.TableClass;
    /**
     * Resource-based IAM policy document (JSON string) attached to the table.
     * Grants cross-account or scoped-principal access to the table and its
     * indexes. Removing the property deletes the policy.
     */
    resourcePolicy?: string;
    /**
     * Streams change data capture records to the given Kinesis Data Stream.
     * Changing the stream disables the old destination before enabling the
     * new one; removing the property disables streaming.
     */
    kinesisStreamingDestination?: KinesisStreamingDestination;
    /**
     * Enables CloudWatch Contributor Insights (table-level rule) for the
     * table, surfacing the most-accessed and most-throttled keys.
     * @default false
     */
    contributorInsightsEnabled?: boolean;
};
export type TableBinding = {
    streamSpecification?: DynamoDB.StreamSpecification;
};
export interface Table extends Resource<"AWS.DynamoDB.Table", TableProps, {
    /** The unique ID AWS assigns to the table. */
    tableId: string;
    /** The physical name of the table. */
    tableName: TableName;
    /** The ARN of the table. */
    tableArn: TableArn;
    /** The partition (hash) key attribute name. */
    partitionKey: string;
    /** The sort (range) key attribute name, if defined. */
    sortKey: string | undefined;
    /** ARN of the most recent DynamoDB stream (when streams are enabled). */
    latestStreamArn: string | undefined;
    /** The current stream configuration (when streams are enabled). */
    streamSpecification: DynamoDB.StreamSpecification | undefined;
    /** Descriptions of the table's local secondary indexes. */
    localSecondaryIndexes: DynamoDB.LocalSecondaryIndexDescription[] | undefined;
    /** Descriptions of the table's global secondary indexes. */
    globalSecondaryIndexes: DynamoDB.GlobalSecondaryIndexDescription[] | undefined;
    /** The point-in-time recovery status of the table. */
    pointInTimeRecoveryDescription: DynamoDB.PointInTimeRecoveryDescription | undefined;
    /** The tags attached to the table. */
    tags: Record<string, string> | undefined;
}, TableBinding, Providers> {
}
/**
 * An Amazon DynamoDB table with optional indexes, PITR, TTL, and stream-aware
 * binding support.
 *
 * `Table` owns the lifecycle of the physical table while the binding contract
 * allows runtime-specific integrations such as Lambda table event sources to
 * request stream configuration without forcing a circular input prop.
 * ### Creating Tables
 * **Example:** Basic Table
 * ```typescript
 * import * as DynamoDB from "alchemy/AWS/DynamoDB";
 *
 * const table = yield* DynamoDB.Table("UsersTable", {
 *   partitionKey: "pk",
 *   attributes: {
 *     pk: "S",
 *   },
 * });
 * ```
 *
 * **Example:** Table with Sort Key and TTL
 * ```typescript
 * const table = yield* DynamoDB.Table("SessionsTable", {
 *   partitionKey: "userId",
 *   sortKey: "sessionId",
 *   attributes: {
 *     userId: "S",
 *     sessionId: "S",
 *     expiresAt: "N",
 *   },
 *   timeToLiveSpecification: {
 *     Enabled: true,
 *     AttributeName: "expiresAt",
 *   },
 * });
 * ```
 *
 * **Example:** Table with Global Secondary Index
 * ```typescript
 * const table = yield* DynamoDB.Table("OrdersTable", {
 *   partitionKey: "pk",
 *   sortKey: "sk",
 *   attributes: {
 *     pk: "S",
 *     sk: "S",
 *     gsi1pk: "S",
 *     gsi1sk: "S",
 *   },
 *   globalSecondaryIndexes: [{
 *     indexName: "GSI1",
 *     partitionKey: "gsi1pk",
 *     sortKey: "gsi1sk",
 *     projection: { ProjectionType: "ALL" },
 *   }],
 * });
 * ```
 *
 * **Example:** Multi-Attribute GSI Keys
 * GSI partition and sort keys may be composed of up to four attributes each,
 * indexing natural domain attributes directly instead of synthetic
 * concatenated keys. Partition attributes are hashed together (queries must
 * specify all of them with equality); sort attributes are queried
 * left-to-right in declaration order.
 * ```typescript
 * const matches = yield* DynamoDB.Table("TournamentMatches", {
 *   partitionKey: "matchId",
 *   attributes: {
 *     matchId: "S",
 *     tournamentId: "S",
 *     region: "S",
 *     round: "S",
 *   },
 *   globalSecondaryIndexes: [{
 *     indexName: "TournamentRegionIndex",
 *     partitionKey: ["tournamentId", "region"],
 *     sortKey: ["round", "matchId"],
 *     projection: { ProjectionType: "ALL" },
 *   }],
 * });
 *
 * // init
 * const query = yield* AWS.DynamoDB.Query(matches);
 *
 * // runtime: query with every partition attribute, then narrow the sort
 * // attributes left-to-right
 * const response = yield* query({
 *   IndexName: "TournamentRegionIndex",
 *   KeyConditionExpression:
 *     "tournamentId = :t AND #r = :r AND round = :round",
 *   ExpressionAttributeNames: { "#r": "region" },
 *   ExpressionAttributeValues: {
 *     ":t": { S: "WINTER2024" },
 *     ":r": { S: "NA-EAST" },
 *     ":round": { S: "SEMIFINALS" },
 *   },
 * });
 * ```
 *
 * ### Runtime Operations
 * Bind DynamoDB operations in the init phase and use them in runtime
 * handlers. Bindings inject the table name and grant scoped IAM
 * permissions automatically.
 *
 * **Example:** Read and write items
 * ```typescript
 * // init
 * const getItem = yield* AWS.DynamoDB.GetItem(table);
 * const putItem = yield* AWS.DynamoDB.PutItem(table);
 *
 * return {
 *   fetch: Effect.gen(function* () {
 *     // runtime
 *     yield* putItem({
 *       Item: { pk: { S: "user#123" }, name: { S: "Alice" } },
 *     });
 *     const result = yield* getItem({
 *       Key: { pk: { S: "user#123" } },
 *     });
 *     return yield* HttpServerResponse.json(result.Item);
 *   }),
 * };
 * ```
 *
 * ### Table Features
 * **Example:** Resource Policy
 * ```typescript
 * const table = yield* DynamoDB.Table("SharedTable", {
 *   partitionKey: "pk",
 *   attributes: { pk: "S" },
 *   resourcePolicy: JSON.stringify({
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Effect: "Allow",
 *       Principal: { AWS: "arn:aws:iam::111122223333:root" },
 *       Action: ["dynamodb:GetItem", "dynamodb:Query"],
 *       Resource: "*",
 *     }],
 *   }),
 * });
 * ```
 *
 * **Example:** Kinesis Streaming Destination
 * ```typescript
 * import * as Kinesis from "alchemy/AWS/Kinesis";
 *
 * const stream = yield* Kinesis.Stream("CdcStream", {});
 * const table = yield* DynamoDB.Table("CdcTable", {
 *   partitionKey: "pk",
 *   attributes: { pk: "S" },
 *   kinesisStreamingDestination: {
 *     streamArn: stream.streamArn,
 *     approximateCreationDateTimePrecision: "MICROSECOND",
 *   },
 * });
 * ```
 *
 * **Example:** Contributor Insights
 * ```typescript
 * const table = yield* DynamoDB.Table("HotKeyTable", {
 *   partitionKey: "pk",
 *   attributes: { pk: "S" },
 *   contributorInsightsEnabled: true,
 * });
 * ```
 *
 * ### DynamoDB Streams
 * Process change data capture events from a DynamoDB table using a
 * Lambda event source mapping. The stream is enabled automatically
 * through the binding contract.
 *
 * **Example:** Process table changes
 * ```typescript
 * // init
 * yield* DynamoDB.consumeTableChanges(
 *   table,
 *   { streamViewType: "NEW_AND_OLD_IMAGES" },
 *   Effect.fn(function* (record) {
 *     yield* Effect.log(`${record.eventName}: ${JSON.stringify(record.dynamodb)}`);
 *   }),
 * );
 * ```
 *
 * @resource
 */
export declare const Table: import("../../Resource.ts").ResourceClass<Table>;
export declare const TableProvider: () => import("effect/Layer").Layer<Provider.Provider<Table>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Table.d.ts.map