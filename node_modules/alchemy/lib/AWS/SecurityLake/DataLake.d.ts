import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * Encryption settings for a Security Lake Region.
 */
export interface DataLakeEncryptionConfiguration {
    /**
     * The KMS key ID used to encrypt objects at rest, or `S3_MANAGED_KEY` for
     * SSE-S3 (the default).
     * @default "S3_MANAGED_KEY"
     */
    kmsKeyId?: string;
}
/**
 * When objects expire out of the data lake.
 */
export interface DataLakeLifecycleExpiration {
    /**
     * How long after creation objects are deleted. Accepts any
     * `Duration.Input` (e.g. `"365 days"`, `Duration.days(365)`; a bare
     * number is milliseconds); the wire unit is whole days.
     */
    days?: Duration.Input;
}
/**
 * A storage-class transition rule.
 */
export interface DataLakeLifecycleTransition {
    /** The S3 storage class to transition into (e.g. `GLACIER`, `ONEZONE_IA`). */
    storageClass?: string;
    /**
     * How long after creation objects transition. Accepts any
     * `Duration.Input` (e.g. `"30 days"`, `Duration.days(30)`; a bare
     * number is milliseconds); the wire unit is whole days.
     */
    days?: Duration.Input;
}
/**
 * Lifecycle management (retention + storage-class transitions) for a Region.
 */
export interface DataLakeLifecycleConfiguration {
    /** When objects expire out of the data lake. */
    expiration?: DataLakeLifecycleExpiration;
    /** Storage-class transition rules. */
    transitions?: DataLakeLifecycleTransition[];
}
/**
 * Rollup-Region replication for a contributing Region.
 */
export interface DataLakeReplicationConfiguration {
    /** The rollup Regions that this Region's data is replicated into. */
    regions?: string[];
    /** IAM role ARN Security Lake assumes to replicate objects. */
    roleArn?: string;
}
/**
 * Per-Region configuration of the Security Lake data lake.
 */
export interface DataLakeRegionConfiguration {
    /** The Region in which Security Lake is enabled. */
    region: string;
    /** Encryption at rest for this Region. */
    encryptionConfiguration?: DataLakeEncryptionConfiguration;
    /** Retention and storage-class transitions for this Region. */
    lifecycleConfiguration?: DataLakeLifecycleConfiguration;
    /** Rollup-Region replication for this Region. */
    replicationConfiguration?: DataLakeReplicationConfiguration;
}
export interface DataLakeProps {
    /**
     * The Regions to enable Security Lake in, each with its own encryption,
     * lifecycle, and replication settings. Adding a Region enables Security Lake
     * there; removing a previously configured Region disables it there.
     */
    configurations: DataLakeRegionConfiguration[];
    /**
     * ARN of the IAM role used by the Security Lake metastore manager (the
     * `AmazonSecurityLakeMetaStoreManagerV2` role) to populate the Glue
     * metastore with partition updates.
     */
    metaStoreManagerRoleArn: string;
    /**
     * Tags applied to the data lake. Alchemy ownership tags are merged in
     * automatically so the data lake can be recognized on subsequent runs.
     */
    tags?: Record<string, string>;
}
/** Attributes of the data lake in one Region. */
export interface DataLakeRegionAttributes {
    /** ARN of the data lake in this Region. */
    dataLakeArn: string;
    /** The Region. */
    region: string;
    /** ARN of the S3 bucket Security Lake created for this Region. */
    s3BucketArn: string | undefined;
    /** Creation status of the data lake in this Region. */
    createStatus: string | undefined;
}
/** @resource */
export interface DataLake extends Resource<"AWS.SecurityLake.DataLake", DataLakeProps, {
    /** ARN of the data lake in the current (deployment) Region. */
    dataLakeArn: string;
    /** Every Region the data lake is enabled in. */
    regions: string[];
    /** Per-Region attributes (ARN, S3 bucket, status). */
    dataLakes: DataLakeRegionAttributes[];
}, never, Providers> {
}
/**
 * The Amazon Security Lake data lake — the account-wide singleton that
 * onboards the account to Security Lake. Enabling it creates S3 buckets,
 * registers them with Lake Formation, and configures the Glue metastore in
 * every configured Region.
 *
 * This is a heavyweight, account-wide resource: enabling/disabling Security
 * Lake affects the whole account, and the S3 buckets it creates are retained
 * after the data lake is deleted.
 *
 * ### Enabling Security Lake
 * **Example:** Single-Region data lake
 * ```typescript
 * const lake = yield* SecurityLake.DataLake("Lake", {
 *   configurations: [{ region: "us-west-2" }],
 *   metaStoreManagerRoleArn: metastoreRole.roleArn,
 * });
 * ```
 *
 * **Example:** Lifecycle management and KMS encryption
 * ```typescript
 * const lake = yield* SecurityLake.DataLake("Lake", {
 *   configurations: [
 *     {
 *       region: "us-west-2",
 *       encryptionConfiguration: { kmsKeyId: key.keyId },
 *       lifecycleConfiguration: {
 *         expiration: { days: "365 days" },
 *         transitions: [{ storageClass: "ONEZONE_IA", days: "30 days" }],
 *       },
 *     },
 *   ],
 *   metaStoreManagerRoleArn: metastoreRole.roleArn,
 *   tags: { team: "security" },
 * });
 * ```
 */
declare const DataLakeResource: import("../../Resource.ts").ResourceClass<DataLake>;
export { DataLakeResource as DataLake };
declare const DataLakeCreateFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "DataLakeCreateFailed";
} & Readonly<A>;
/**
 * The data lake failed to reach `COMPLETED` in one of the configured Regions.
 */
export declare class DataLakeCreateFailed extends DataLakeCreateFailed_base<{
    readonly region: string;
    readonly reason: string | undefined;
    readonly code: string | undefined;
}> {
}
export declare const DataLakeProvider: () => import("effect/Layer").Layer<Provider.Provider<DataLake>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DataLake.d.ts.map