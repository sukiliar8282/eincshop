import * as dms from "@distilled.cloud/aws/database-migration-service";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * Direction of a DMS endpoint relative to the replication:
 * `source` reads from the database, `target` writes to it.
 */
export type EndpointType = "source" | "target";
export interface EndpointProps {
    /**
     * Database-migration endpoint identifier. Must be lowercase, 1-255
     * characters, begin with a letter, and contain only letters, digits, and
     * hyphens (no two consecutive hyphens, no trailing hyphen). If omitted, a
     * deterministic physical name is generated. Changing it replaces the
     * endpoint.
     */
    endpointIdentifier?: string;
    /**
     * Whether this endpoint is the migration `source` or `target`.
     */
    endpointType: EndpointType;
    /**
     * Database engine, e.g. `"mysql"`, `"postgres"`, `"aurora"`, `"s3"`,
     * `"kinesis"`, `"docdb"`. Determines which `*Settings` block applies.
     */
    engineName: string;
    /**
     * User name used to connect to the endpoint database.
     */
    username?: string;
    /**
     * Password used to connect to the endpoint database. Marked sensitive.
     */
    password?: Redacted.Redacted<string>;
    /**
     * Host name of the endpoint database server.
     */
    serverName?: string;
    /**
     * Port the endpoint database listens on.
     */
    port?: number;
    /**
     * Name of the endpoint database.
     */
    databaseName?: string;
    /**
     * Additional attributes accepted by DMS as a semicolon-separated string.
     */
    extraConnectionAttributes?: string;
    /**
     * Customer-managed KMS key for connection-secret encryption. Changing the
     * key replaces the endpoint.
     * @default AWS-owned DMS key
     */
    kmsKeyId?: string;
    /**
     * ARN of a certificate DMS uses for SSL connections to the endpoint.
     */
    certificateArn?: string;
    /**
     * SSL mode for the connection.
     * @default "none"
     */
    sslMode?: dms.DmsSslModeValue;
    /**
     * IAM role ARN DMS assumes to access the endpoint (required for S3,
     * DynamoDB, Kinesis, and other AWS-service targets).
     */
    serviceAccessRoleArn?: string;
    /**
     * Externally-defined table definition JSON (S3/DynamoDB targets).
     */
    externalTableDefinition?: string;
    /** Settings for an Amazon S3 endpoint. */
    s3Settings?: dms.S3Settings;
    /** Settings for an Amazon DynamoDB target endpoint. */
    dynamoDbSettings?: dms.DynamoDbSettings;
    /** Settings for an Amazon Kinesis Data Streams target endpoint. */
    kinesisSettings?: dms.KinesisSettings;
    /** Settings for an Apache Kafka target endpoint. */
    kafkaSettings?: dms.KafkaSettings;
    /** Settings for an OpenSearch/Elasticsearch target endpoint. */
    elasticsearchSettings?: dms.ElasticsearchSettings;
    /** Settings for an Amazon Neptune target endpoint. */
    neptuneSettings?: dms.NeptuneSettings;
    /** Settings for an Amazon Redshift target endpoint. */
    redshiftSettings?: dms.RedshiftSettings;
    /** Settings for a PostgreSQL endpoint. */
    postgreSQLSettings?: dms.PostgreSQLSettings;
    /** Settings for a MySQL endpoint. */
    mySQLSettings?: dms.MySQLSettings;
    /** Settings for an Oracle endpoint. */
    oracleSettings?: dms.OracleSettings;
    /** Settings for a Microsoft SQL Server endpoint. */
    microsoftSQLServerSettings?: dms.MicrosoftSQLServerSettings;
    /** Settings for a MongoDB endpoint. */
    mongoDbSettings?: dms.MongoDbSettings;
    /** Settings for an Amazon DocumentDB endpoint. */
    docDbSettings?: dms.DocDbSettings;
    /** Settings for a Redis target endpoint. */
    redisSettings?: dms.RedisSettings;
    /**
     * User-defined tags for the endpoint.
     */
    tags?: Record<string, string>;
}
export interface Endpoint extends Resource<"AWS.DMS.Endpoint", EndpointProps, {
    /** The endpoint identifier (unique per account/region). */
    endpointIdentifier: string;
    /** The ARN of the endpoint. */
    endpointArn: string;
    /** Whether the endpoint is a `source` or `target`. */
    endpointType: string;
    /** The database engine of the endpoint, e.g. `postgres`, `mysql`. */
    engineName: string;
    /** The current status of the endpoint, e.g. `active`. */
    status: string | undefined;
    /** The tags attached to the endpoint. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS Database Migration Service (DMS) endpoint — the source or target
 * database of a replication. Endpoints are metadata-only (they store
 * connection information, not data), so they are free and fast to create.
 * ### Creating Endpoints
 * **Example:** MySQL Source Endpoint
 * ```typescript
 * const source = yield* Endpoint("Source", {
 *   endpointType: "source",
 *   engineName: "mysql",
 *   serverName: "source-db.example.com",
 *   port: 3306,
 *   username: "admin",
 *   password: Redacted.make("super-secret"),
 *   databaseName: "app",
 * });
 * ```
 *
 * **Example:** S3 Target Endpoint
 * ```typescript
 * const target = yield* Endpoint("Target", {
 *   endpointType: "target",
 *   engineName: "s3",
 *   serviceAccessRoleArn: role.roleArn,
 *   s3Settings: {
 *     BucketName: bucket.bucketName,
 *     ServiceAccessRoleArn: role.roleArn,
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Endpoint: import("../../Resource.ts").ResourceClass<Endpoint>;
export declare const EndpointProvider: () => import("effect/Layer").Layer<Provider.Provider<Endpoint>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Endpoint.d.ts.map