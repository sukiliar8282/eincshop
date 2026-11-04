import * as appconfig from "@distilled.cloud/aws/appconfig";
import * as Effect from "effect/Effect";
/**
 * Build the ARN of an AppConfig application from its identity.
 * `arn:aws:appconfig:{region}:{account}:application/{appId}`
 */
export declare const applicationArn: (region: string, accountId: string, applicationId: string) => string;
/**
 * Build the ARN of an AppConfig environment.
 * `arn:aws:appconfig:{region}:{account}:application/{appId}/environment/{envId}`
 */
export declare const environmentArn: (region: string, accountId: string, applicationId: string, environmentId: string) => string;
/**
 * Build the ARN of an AppConfig configuration profile.
 * `arn:aws:appconfig:{region}:{account}:application/{appId}/configurationprofile/{id}`
 */
export declare const configurationProfileArn: (region: string, accountId: string, applicationId: string, configurationProfileId: string) => string;
/**
 * Build the ARN of an AppConfig deployment strategy.
 * `arn:aws:appconfig:{region}:{account}:deploymentstrategy/{id}`
 */
export declare const deploymentStrategyArn: (region: string, accountId: string, deploymentStrategyId: string) => string;
/**
 * Data-plane resource ARN used by appconfigdata (StartConfigurationSession /
 * GetLatestConfiguration). Note the segment is `configuration`, not
 * `configurationprofile`.
 * `arn:aws:appconfig:{region}:{account}:application/{appId}/environment/{envId}/configuration/{profileId}`
 */
export declare const configurationDataArn: (region: string, accountId: string, applicationId: string, environmentId: string, configurationProfileId: string) => string;
/**
 * Build the ARN of an AppConfig extension association.
 * `arn:aws:appconfig:{region}:{account}:extensionassociation/{id}`
 */
export declare const extensionAssociationArn: (region: string, accountId: string, extensionAssociationId: string) => string;
/** Drop undefined values from an AppConfig tag map. */
export declare const toTagRecord: (tags: {
    [key: string]: string | undefined;
} | undefined) => Record<string, string>;
/**
 * Read the observed tags of an AppConfig resource. Tag reads are best-effort —
 * a failure (e.g. a race with deletion) reports no tags.
 */
export declare const readAppConfigTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync tags on an AppConfig resource: diff the OBSERVED cloud tags against the
 * desired set and apply only the delta.
 */
export declare const syncAppConfigTags: (arn: string, desiredTags: Record<string, string>) => Effect.Effect<void, appconfig.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=internal.d.ts.map