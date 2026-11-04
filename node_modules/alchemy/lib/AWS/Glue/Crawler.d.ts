import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface CrawlerS3Target {
    /** S3 path to crawl, e.g. `s3://my-bucket/data/`. */
    path: string;
    /** Glob patterns to exclude. */
    exclusions?: string[];
    /** Name of a Glue connection to use (for VPC-scoped S3). */
    connectionName?: string;
    /** Sample size (files per leaf) to speed up crawling. */
    sampleSize?: number;
    /** SQS queue ARN for event-based (incremental) crawling. */
    eventQueueArn?: string;
    /** Dead-letter SQS queue ARN for event-based crawling. */
    dlqEventQueueArn?: string;
}
export interface CrawlerJdbcTarget {
    /** Name of the Glue connection to the JDBC source. */
    connectionName?: string;
    /** The path of the JDBC target, e.g. `database/schema/%`. */
    path?: string;
    /** Glob patterns to exclude. */
    exclusions?: string[];
}
export interface CrawlerDynamoDbTarget {
    /** The DynamoDB table name to crawl. */
    path?: string;
    /** Whether to scan all records (vs a sample). */
    scanAll?: boolean;
    /** Fraction of the table's read capacity to consume (0.1–1.5). */
    scanRate?: number;
}
export interface CrawlerCatalogTarget {
    /** The database of the catalog tables to recrawl. */
    databaseName: string;
    /** The tables in the database to recrawl. */
    tables: string[];
    /** Name of a Glue connection. */
    connectionName?: string;
}
export interface CrawlerTargets {
    /** S3 data-store targets. */
    s3Targets?: CrawlerS3Target[];
    /** JDBC data-store targets. */
    jdbcTargets?: CrawlerJdbcTarget[];
    /** DynamoDB targets. */
    dynamoDbTargets?: CrawlerDynamoDbTarget[];
    /** Glue Data Catalog targets (recrawl existing tables). */
    catalogTargets?: CrawlerCatalogTarget[];
}
export interface CrawlerProps {
    /**
     * Name of the crawler. If omitted, a unique name is generated. Changing the
     * name replaces the crawler.
     * @default a generated physical name
     */
    crawlerName?: string;
    /**
     * The IAM role (ARN or name) the crawler assumes to access data stores and
     * write to the Data Catalog.
     */
    role: string;
    /**
     * The Glue database where the crawler writes discovered tables.
     */
    databaseName?: string;
    /**
     * A description of the crawler.
     */
    description?: string;
    /**
     * The data stores to crawl.
     */
    targets: CrawlerTargets;
    /**
     * A `cron(...)` schedule expression. Omit for on-demand crawling.
     * @example "cron(0 12 * * ? *)"
     */
    schedule?: string;
    /**
     * A prefix prepended to the names of tables the crawler creates.
     */
    tablePrefix?: string;
    /**
     * Custom classifier names, in priority order.
     */
    classifiers?: string[];
    /**
     * How the crawler handles schema changes and deleted objects.
     */
    schemaChangePolicy?: {
        /** What to do when a schema changes: `LOG` or `UPDATE_IN_DATABASE`. */
        updateBehavior?: "LOG" | "UPDATE_IN_DATABASE";
        /**
         * What to do with deleted objects: `LOG`, `DELETE_FROM_DATABASE`, or
         * `DEPRECATE_IN_DATABASE`.
         */
        deleteBehavior?: "LOG" | "DELETE_FROM_DATABASE" | "DEPRECATE_IN_DATABASE";
    };
    /**
     * Incremental-crawl behavior.
     */
    recrawlPolicy?: {
        /**
         * `CRAWL_EVERYTHING`, `CRAWL_NEW_FOLDERS_ONLY`, or `CRAWL_EVENT_MODE`.
         */
        recrawlBehavior?: "CRAWL_EVERYTHING" | "CRAWL_NEW_FOLDERS_ONLY" | "CRAWL_EVENT_MODE";
    };
    /**
     * Crawler configuration JSON string (grouping/partitions behavior).
     */
    configuration?: string;
    /**
     * Tags to apply to the crawler. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Crawler extends Resource<"AWS.Glue.Crawler", CrawlerProps, {
    /** The name of the crawler. */
    crawlerName: string;
    /** The ARN of the crawler. */
    crawlerArn: string;
    /** The IAM role the crawler assumes. */
    role: string;
    /** The Glue database the crawler writes discovered tables to. */
    databaseName: string | undefined;
    /** The crawler state: `READY`, `RUNNING`, or `STOPPING`. */
    state: string | undefined;
}, {}, Providers> {
}
/**
 * An AWS Glue crawler — connects to an S3 (or JDBC/DynamoDB/catalog) data
 * store, infers schemas, and populates the Glue Data Catalog with tables.
 * Runs are asynchronous: create the crawler, then invoke `startCrawler` (or
 * attach a schedule).
 * ### Creating Crawlers
 * **Example:** S3 Crawler
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const database = yield* AWS.Glue.Database("Analytics", {
 *   databaseName: "analytics",
 * });
 *
 * const crawler = yield* AWS.Glue.Crawler("EventsCrawler", {
 *   role: crawlerRole.roleArn,
 *   databaseName: database.databaseName,
 *   targets: {
 *     s3Targets: [{ path: "s3://my-data-lake/events/" }],
 *   },
 * });
 * ```
 *
 * **Example:** Scheduled Crawler with Schema Policy
 * ```typescript
 * const crawler = yield* AWS.Glue.Crawler("EventsCrawler", {
 *   role: crawlerRole.roleArn,
 *   databaseName: database.databaseName,
 *   targets: { s3Targets: [{ path: "s3://my-data-lake/events/" }] },
 *   schedule: "cron(0 12 * * ? *)",
 *   tablePrefix: "raw_",
 *   schemaChangePolicy: {
 *     updateBehavior: "UPDATE_IN_DATABASE",
 *     deleteBehavior: "DEPRECATE_IN_DATABASE",
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Crawler: import("../../Resource.ts").ResourceClass<Crawler>;
export declare const CrawlerProvider: () => import("effect/Layer").Layer<Provider.Provider<Crawler>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Crawler.d.ts.map