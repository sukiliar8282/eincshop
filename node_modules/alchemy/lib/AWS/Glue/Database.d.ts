import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface DatabaseProps {
    /**
     * Name of the database. Glue lowercases database names, so provide a
     * lowercase name. If omitted, a unique lowercase name is generated.
     * Changing the name replaces the database.
     * @default a generated lowercase physical name
     */
    databaseName?: string;
    /**
     * A description of the database.
     */
    description?: string;
    /**
     * The location of the database (for example, an S3 path) used as the
     * default for tables that do not specify their own location.
     */
    locationUri?: string;
    /**
     * Free-form key/value properties stored on the database. Alchemy adds its
     * own `alchemy::*` ownership markers to this map (Glue databases are not
     * ARN-taggable) — user keys are preserved alongside them.
     */
    parameters?: Record<string, string>;
    /**
     * The AWS account ID of the Data Catalog the database lives in. Changing it
     * replaces the database.
     * @default the caller's account (the default Data Catalog)
     */
    catalogId?: string;
}
export interface Database extends Resource<"AWS.Glue.Database", DatabaseProps, {
    /** The (lowercase) name of the database. */
    databaseName: string;
    /** The ARN of the database. */
    databaseArn: string;
    /** The AWS account ID of the Data Catalog the database lives in. */
    catalogId: string;
}, {}, Providers> {
}
/**
 * An AWS Glue Data Catalog database — the top-level container for Glue tables
 * that Athena, EMR, Redshift Spectrum, and Glue jobs query. Databases are free
 * and instant to create.
 * ### Creating Databases
 * **Example:** Basic Database
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const database = yield* AWS.Glue.Database("Analytics", {
 *   databaseName: "analytics",
 * });
 * ```
 *
 * **Example:** Database with a Default S3 Location
 * ```typescript
 * const database = yield* AWS.Glue.Database("Analytics", {
 *   databaseName: "analytics",
 *   description: "Curated analytics tables",
 *   locationUri: "s3://my-data-lake/analytics/",
 *   parameters: { classification: "parquet" },
 * });
 * ```
 *
 * @resource
 */
export declare const Database: import("../../Resource.ts").ResourceClass<Database>;
export declare const DatabaseProvider: () => import("effect/Layer").Layer<Provider.Provider<Database>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Database.d.ts.map