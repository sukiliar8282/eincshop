import * as kendra from "@distilled.cloud/aws/kendra";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export type IndexStatus = kendra.IndexStatus;
export type IndexEdition = kendra.IndexEdition;
/**
 * Server-side encryption settings for a Kendra index.
 */
export interface IndexServerSideEncryption {
    /**
     * The identifier of the customer-managed KMS key. Kendra does not support
     * asymmetric keys.
     */
    kmsKeyId?: string;
}
/**
 * Provisioned capacity for an `ENTERPRISE_EDITION` index.
 */
export interface IndexCapacityUnits {
    /**
     * Extra storage capacity units. Each unit adds 30 GB / 500k documents.
     */
    storageCapacityUnits: number;
    /**
     * Extra query capacity units. Each unit adds 0.1 queries/sec.
     */
    queryCapacityUnits: number;
}
export interface IndexProps {
    /**
     * Name of the index.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * The Kendra edition to provision.
     *
     * `GEN_AI_ENTERPRISE_EDITION` is the recommended edition for new
     * deployments. Changing the edition replaces the index.
     * @default "DEVELOPER_EDITION"
     */
    edition?: IndexEdition;
    /**
     * ARN of the IAM role that grants Kendra permission to write CloudWatch
     * log and metric data.
     */
    roleArn: string;
    /**
     * A description of the index.
     */
    description?: string;
    /**
     * Encryption-at-rest configuration. Changing it replaces the index.
     */
    serverSideEncryption?: IndexServerSideEncryption;
    /**
     * How to filter query results on user context (`ATTRIBUTE_FILTER` or
     * `USER_TOKEN`).
     */
    userContextPolicy?: kendra.UserContextPolicy;
    /**
     * JWT / JSON token configurations used to authorize queries.
     */
    userTokenConfigurations?: kendra.UserTokenConfiguration[];
    /**
     * Fetch user-group information from IAM Identity Center.
     */
    userGroupResolutionConfiguration?: kendra.UserGroupResolutionConfiguration;
    /**
     * Extra provisioned storage and query capacity (only meaningful for
     * `ENTERPRISE_EDITION` indexes).
     */
    capacityUnits?: IndexCapacityUnits;
    /**
     * Tags to associate with the index.
     */
    tags?: Record<string, string>;
}
export interface Index extends Resource<"AWS.Kendra.Index", IndexProps, {
    /**
     * Service-assigned unique identifier of the index.
     */
    id: string;
    /**
     * ARN of the index.
     */
    arn: string;
    /**
     * The index's name.
     */
    name: string;
    /**
     * The provisioned edition.
     */
    edition: IndexEdition | undefined;
    /**
     * Current lifecycle status of the index.
     */
    status: IndexStatus | undefined;
    /**
     * ARN of the IAM role used for CloudWatch logs/metrics.
     */
    roleArn: string;
    /**
     * Current tags reported for the index.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon Kendra index — a machine-learning powered enterprise search
 * index that data sources (S3, SharePoint, databases, ...) sync documents
 * into and that applications query with natural language.
 *
 * :::caution
 * Provisioning an index takes ~20–30 minutes and bills hourly from the
 * moment the index becomes `ACTIVE` (including the Developer edition's
 * free-tier-exhausted rate). Destroy indexes promptly.
 * :::
 * ### Creating Indexes
 * **Example:** Developer-Edition Index
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const role = yield* AWS.IAM.Role("KendraRole", {
 *   assumeRolePolicy: {
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Effect: "Allow",
 *       Principal: { Service: "kendra.amazonaws.com" },
 *       Action: "sts:AssumeRole",
 *     }],
 *   },
 *   policies: [{
 *     policyName: "logs",
 *     policyDocument: {
 *       Version: "2012-10-17",
 *       Statement: [{
 *         Effect: "Allow",
 *         Action: ["logs:*", "cloudwatch:PutMetricData"],
 *         Resource: "*",
 *       }],
 *     },
 *   }],
 * });
 *
 * const index = yield* AWS.Kendra.Index("Search", {
 *   edition: "DEVELOPER_EDITION",
 *   roleArn: role.roleArn,
 * });
 * ```
 *
 * @resource
 */
export declare const Index: import("../../Resource.ts").ResourceClass<Index>;
declare const IndexProvisioningFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "IndexProvisioningFailed";
} & Readonly<A>;
/**
 * An index whose asynchronous provisioning converged to the terminal
 * `FAILED` status.
 */
export declare class IndexProvisioningFailed extends IndexProvisioningFailed_base<{
    readonly id: string;
    readonly message: string | undefined;
}> {
}
export declare const IndexProvider: () => import("effect/Layer").Layer<Provider.Provider<Index>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=SearchIndex.d.ts.map