import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment, type AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type DatabaseArn = `arn:aws:timestream:${RegionID}:${AccountID}:database/${string}`;
export interface DatabaseProps {
    /**
     * Name of the Timestream database. Must be unique within the account and
     * region and between 3 and 256 characters.
     * @default ${app}-${stage}-${id}
     */
    databaseName?: string;
    /**
     * The ID (or ARN/alias) of the KMS key used to encrypt data at rest. When
     * omitted, Timestream provisions and manages an AWS-owned KMS key.
     */
    kmsKeyId?: string;
    /**
     * Tags to associate with the database.
     */
    tags?: Record<string, string>;
}
export interface Database extends Resource<"AWS.Timestream.Database", DatabaseProps, {
    /**
     * The database's physical name.
     */
    databaseName: string;
    /**
     * ARN of the database.
     */
    databaseArn: DatabaseArn;
    /**
     * The KMS key backing encryption at rest.
     */
    kmsKeyId: string | undefined;
    /**
     * Number of tables in the database.
     */
    tableCount: number | undefined;
    /**
     * Current tags reported for the database.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon Timestream for LiveAnalytics database — the top-level container for
 * time-series {@link Table}s.
 *
 * `Database` owns the database's lifecycle and its mutable configuration: the
 * KMS key used for encryption at rest and its tags. A database name is
 * auto-generated from the app, stage, and logical ID unless you provide one.
 *
 * :::note
 * Timestream for LiveAnalytics is closed to new AWS customers. Accounts that
 * were not already onboarded receive `TimestreamNotOnboarded` (a specialized
 * `AccessDenied`) on every operation.
 * :::
 * ### Creating Databases
 * **Example:** Basic Database
 * ```typescript
 * import * as Timestream from "alchemy/AWS/Timestream";
 *
 * const database = yield* Timestream.Database("Metrics");
 * ```
 *
 * **Example:** Database with a Customer-Managed KMS Key
 * ```typescript
 * const database = yield* Timestream.Database("SecureMetrics", {
 *   kmsKeyId: "alias/my-timestream-key",
 *   tags: { Environment: "production" },
 * });
 * ```
 *
 * @resource
 */
export declare const Database: import("../../Resource.ts").ResourceClass<Database>;
export declare const DatabaseProvider: () => import("effect/Layer").Layer<Provider.Provider<Database>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Database.d.ts.map