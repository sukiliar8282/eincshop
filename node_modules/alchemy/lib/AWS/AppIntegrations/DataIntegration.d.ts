import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface DataIntegrationScheduleConfig {
    /**
     * The start date for objects to import, in ISO 8601 format,
     * e.g. `2024-01-01T00:00:00Z`.
     */
    firstExecutionFrom?: string;
    /**
     * The name of the object to pull from the data source.
     */
    object?: string;
    /**
     * How often the data should be pulled from the data source, e.g.
     * `rate(1 hours)`.
     */
    scheduleExpression: string;
}
export interface DataIntegrationProps {
    /**
     * Name of the data integration. If omitted, a unique name is generated
     * from the app, stage, and logical ID. The name can be updated in place.
     */
    name?: string;
    /**
     * Description of the data integration (1-1000 characters).
     */
    description?: string;
    /**
     * The ARN of the KMS key used to encrypt the data integration. Changing
     * the key replaces the data integration.
     */
    kmsKey: string;
    /**
     * The URI of the data source, e.g. `s3://my-bucket` or
     * `Salesforce://AppFlow/my-connector-profile`. Changing the source URI
     * replaces the data integration.
     */
    sourceURI: string;
    /**
     * The scheduling configuration for pulling data from the source. Required
     * for SaaS (AppFlow) sources; must be omitted for S3 sources. Changing it
     * replaces the data integration.
     */
    scheduleConfig?: DataIntegrationScheduleConfig;
    /**
     * The configuration for which files to pull from the source (folders and
     * filters). Changing it replaces the data integration.
     */
    fileConfiguration?: {
        /**
         * Identifiers for the source folders to pull all files from recursively.
         */
        folders: string[];
        /**
         * Restrictions for what files should be pulled from the source.
         */
        filters?: Record<string, string[]>;
    };
    /**
     * The configuration for which objects and fields to pull from the source.
     * Changing it replaces the data integration.
     */
    objectConfiguration?: Record<string, Record<string, string[]>>;
    /**
     * Tags to apply to the data integration. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface DataIntegration extends Resource<"AWS.AppIntegrations.DataIntegration", DataIntegrationProps, {
    dataIntegrationId: string;
    dataIntegrationArn: string;
    dataIntegrationName: string;
    kmsKey: string;
    sourceURI: string;
}, never, Providers> {
}
/**
 * An Amazon AppIntegrations data integration. Data integrations reference an
 * external data source (an S3 bucket, or a SaaS application through Amazon
 * AppFlow) so services like Amazon Q in Connect can ingest its content.
 *
 * The KMS key, source URI, schedule, file configuration, and object
 * configuration are immutable; changing any of them replaces the data
 * integration. Only the name and description can be updated in place.
 * ### Creating a Data Integration
 * **Example:** S3 Data Integration
 * ```typescript
 * import * as AppIntegrations from "alchemy/AWS/AppIntegrations";
 * import * as KMS from "alchemy/AWS/KMS";
 * import * as S3 from "alchemy/AWS/S3";
 *
 * const bucket = yield* S3.Bucket("Content");
 * const key = yield* KMS.Key("ContentKey");
 *
 * const integration = yield* AppIntegrations.DataIntegration("Content", {
 *   kmsKey: key.keyArn,
 *   sourceURI: Output.interpolate`s3://${bucket.bucketName}`,
 * });
 * ```
 *
 * **Example:** Scheduled SaaS Data Integration
 * ```typescript
 * const integration = yield* AppIntegrations.DataIntegration("Salesforce", {
 *   kmsKey: key.keyArn,
 *   sourceURI: "Salesforce://AppFlow/my-connector-profile",
 *   scheduleConfig: {
 *     firstExecutionFrom: "2024-01-01T00:00:00Z",
 *     object: "Account",
 *     scheduleExpression: "rate(1 hours)",
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const DataIntegration: import("../../Resource.ts").ResourceClass<DataIntegration>;
declare const DataIntegrationIncomplete_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "DataIntegrationIncomplete";
} & Readonly<A>;
/**
 * Raised when the AppIntegrations API returns a data integration without
 * the fields required to build the resource attributes.
 */
export declare class DataIntegrationIncomplete extends DataIntegrationIncomplete_base<{
    message: string;
}> {
}
export declare const DataIntegrationProvider: () => import("effect/Layer").Layer<Provider.Provider<DataIntegration>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=DataIntegration.d.ts.map