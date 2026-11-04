import * as quicksight from "@distilled.cloud/aws/quicksight";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * Properties for an Amazon QuickSight data source — a connection to an
 * external data store (Athena, S3, Redshift, an RDS engine, etc.) that
 * datasets read from.
 */
export interface DataSourceProps {
    /**
     * Unique id of the data source within the account. Stable — changing it
     * replaces the data source. If omitted, a unique id is generated.
     */
    dataSourceId?: string;
    /**
     * Display name of the data source.
     */
    name: string;
    /**
     * Type of the underlying data store (e.g. `ATHENA`, `S3`, `REDSHIFT`,
     * `POSTGRESQL`). Immutable — changing the type replaces the data source.
     */
    type: quicksight.DataSourceType;
    /**
     * Connection parameters specific to the data source `type` (e.g.
     * `AthenaParameters.WorkGroup`, `S3Parameters.ManifestFileLocation`).
     */
    dataSourceParameters?: quicksight.DataSourceParameters;
    /**
     * Credentials QuickSight uses to connect. Only required for stores that
     * authenticate with a username/password or a Secrets Manager secret.
     * Not required for `ATHENA`/`S3` sources that rely on the QuickSight IAM
     * role.
     */
    credentials?: quicksight.DataSourceCredentials;
    /**
     * Resource-level permissions granting QuickSight principals access to the
     * data source.
     */
    permissions?: quicksight.ResourcePermission[];
    /**
     * VPC connection used to reach a data store inside a VPC.
     */
    vpcConnectionProperties?: quicksight.VpcConnectionProperties;
    /**
     * SSL options for the connection.
     */
    sslProperties?: quicksight.SslProperties;
    /**
     * Tags to apply to the data source.
     */
    tags?: Record<string, string>;
}
export interface DataSource extends Resource<"AWS.QuickSight.DataSource", DataSourceProps, {
    /** Unique id of the data source within the account. */
    dataSourceId: string;
    /** ARN of the data source. */
    arn: string;
    /** Display name of the data source. */
    name: string;
    /** Type of the underlying data store. */
    type: quicksight.DataSourceType;
    /** Current lifecycle status (e.g. `CREATION_SUCCESSFUL`). */
    status: string;
}, never, Providers> {
}
/**
 * An Amazon QuickSight data source — a connection to an external data store
 * that datasets read from.
 *
 * QuickSight requires an active account subscription in the region. Without
 * one, create operations fail with the typed `QuickSightSubscriptionRequired`
 * error.
 *
 * ### Creating a Data Source
 * **Example:** Athena Data Source
 * ```typescript
 * const source = yield* DataSource("analytics", {
 *   name: "Athena Analytics",
 *   type: "ATHENA",
 *   dataSourceParameters: { AthenaParameters: { WorkGroup: "primary" } },
 * });
 * ```
 *
 * **Example:** S3 Manifest Data Source
 * ```typescript
 * const source = yield* DataSource("s3-source", {
 *   name: "S3 Sales Data",
 *   type: "S3",
 *   dataSourceParameters: {
 *     S3Parameters: {
 *       ManifestFileLocation: { Bucket: "my-bucket", Key: "manifest.json" },
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const DataSource: import("../../Resource.ts").ResourceClass<DataSource>;
export declare const DataSourceProvider: () => import("effect/Layer").Layer<Provider.Provider<DataSource>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DataSource.d.ts.map