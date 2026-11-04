import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * The Glue crawler configuration Security Lake uses to catalog the custom
 * source's OCSF data.
 */
export interface CustomLogSourceCrawlerConfiguration {
    /**
     * ARN of the IAM role the Glue crawler assumes. The role must be assumable
     * by `glue.amazonaws.com` and grant access to the Security Lake bucket
     * prefix for this source.
     */
    roleArn: string;
}
/**
 * The AWS identity (principal + external ID) the custom-source provider uses
 * to write data into the data lake.
 */
export interface CustomLogSourceProviderIdentity {
    /** The AWS account ID (or principal) of the log provider. */
    principal: string;
    /** The external ID the provider must present when assuming the role. */
    externalId: string;
}
export interface CustomLogSourceProps {
    /**
     * Name of the custom log source. Must be unique per account/Region.
     * If omitted, a unique physical name is generated from the app, stage,
     * and logical ID. Changing this replaces the source.
     */
    sourceName?: string;
    /**
     * The version of the custom source schema. Changing this replaces the
     * source.
     * @default - Security Lake assigns a version
     */
    sourceVersion?: string;
    /**
     * The Open Cybersecurity Schema Framework (OCSF) event classes the source
     * emits (e.g. `FILE_ACTIVITY`, `DNS_ACTIVITY`). Changing this replaces the
     * source.
     */
    eventClasses?: string[];
    /**
     * The Glue crawler configuration for cataloging the source's data.
     * Changing this replaces the source.
     */
    crawlerConfiguration: CustomLogSourceCrawlerConfiguration;
    /**
     * The AWS identity of the provider that writes this source's data.
     * Changing this replaces the source.
     */
    providerIdentity: CustomLogSourceProviderIdentity;
}
/** @resource */
export interface CustomLogSource extends Resource<"AWS.SecurityLake.CustomLogSource", CustomLogSourceProps, {
    /** Name of the custom log source. */
    sourceName: string;
    /** The resolved source schema version. */
    sourceVersion: string | undefined;
    /** ARN of the Glue crawler created for the source. */
    crawlerArn: string | undefined;
    /** ARN of the Glue database created for the source. */
    databaseArn: string | undefined;
    /** ARN of the Glue table created for the source. */
    tableArn: string | undefined;
    /** ARN of the IAM role the provider assumes to write data. */
    providerRoleArn: string | undefined;
    /** S3 location the provider writes OCSF data to. */
    providerLocation: string | undefined;
}, never, Providers> {
}
/**
 * A custom (third-party) log source registered with Amazon Security Lake.
 * Security Lake provisions a Glue crawler, database, and table for the
 * source, plus an IAM role the provider assumes to write OCSF-formatted data
 * into the data lake. Requires `SecurityLake.DataLake` to already be enabled
 * in the Region.
 *
 * Every configuration property is create-only — changing any of them
 * replaces the source.
 *
 * ### Registering a custom source
 * **Example:** Custom source with a crawler role
 * ```typescript
 * const custom = yield* SecurityLake.CustomLogSource("AppLogs", {
 *   sourceName: "my-app-logs",
 *   eventClasses: ["FILE_ACTIVITY"],
 *   crawlerConfiguration: { roleArn: crawlerRole.roleArn },
 *   providerIdentity: {
 *     principal: "123456789012",
 *     externalId: "my-app-external-id",
 *   },
 * });
 * ```
 */
declare const CustomLogSourceResource: import("../../Resource.ts").ResourceClass<CustomLogSource>;
export { CustomLogSourceResource as CustomLogSource };
export declare const CustomLogSourceProvider: () => import("effect/Layer").Layer<Provider.Provider<CustomLogSource>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=CustomLogSource.d.ts.map