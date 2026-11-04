import * as s3control from "@distilled.cloud/aws/s3-control";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment, type AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
/**
 * Block-public-access settings for an access point. Unlike buckets, AWS
 * defaults every flag to `true` for access points when the configuration is
 * omitted at creation time.
 */
export interface AccessPointPublicAccessBlock {
    /**
     * Block new public ACLs and uploading public objects.
     * @default true
     */
    blockPublicAcls?: boolean;
    /**
     * Ignore all public ACLs on the access point.
     * @default true
     */
    ignorePublicAcls?: boolean;
    /**
     * Block new access point policies that grant public access.
     * @default true
     */
    blockPublicPolicy?: boolean;
    /**
     * Restrict access granted by public policies to AWS principals.
     * @default true
     */
    restrictPublicBuckets?: boolean;
}
export interface AccessPointProps {
    /**
     * Name of the access point (3-50 characters, lowercase letters, numbers
     * and hyphens). If omitted, a unique name is generated from the app,
     * stage and logical ID.
     *
     * Changing the name replaces the access point.
     * @default ${app}-${stage}-${id}
     */
    accessPointName?: string;
    /**
     * Name of the S3 bucket the access point is attached to.
     *
     * Changing the bucket replaces the access point.
     */
    bucket: string;
    /**
     * AWS account ID that owns the bucket, when the bucket is in a
     * different account than the access point.
     *
     * Changing the bucket account replaces the access point.
     */
    bucketAccountId?: string;
    /**
     * Restrict the access point to a VPC. When set, only requests from the
     * given VPC can reach the access point (`NetworkOrigin: VPC`); when
     * omitted the access point accepts requests from the internet
     * (`NetworkOrigin: Internet`).
     *
     * Changing the VPC configuration replaces the access point.
     */
    vpcConfiguration?: {
        /** ID of the VPC the access point is restricted to. */
        vpcId: string;
    };
    /**
     * Block-public-access settings. AWS defaults every flag to `true` for
     * access points when omitted.
     *
     * Changing these settings replaces the access point (they are
     * create-only on access points).
     */
    publicAccessBlock?: AccessPointPublicAccessBlock;
    /**
     * Tags to apply to the access point. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface AccessPoint extends Resource<"AWS.S3Control.AccessPoint", AccessPointProps, {
    /**
     * Name of the access point.
     */
    accessPointName: string;
    /**
     * ARN of the access point.
     */
    accessPointArn: string;
    /**
     * The S3-assigned alias of the access point. The alias can be used
     * anywhere a bucket name is accepted (e.g. `GetObject`).
     */
    alias: string | undefined;
    /**
     * Name of the bucket the access point is attached to.
     */
    bucket: string;
    /**
     * Whether the access point allows access from the public internet
     * (`Internet`) or only from a VPC (`VPC`).
     */
    networkOrigin: s3control.NetworkOrigin;
    /**
     * AWS region of the access point.
     */
    region: RegionID;
    /**
     * AWS account ID that owns the access point.
     */
    accountId: AccountID;
}, never, Providers> {
}
/**
 * An Amazon S3 Access Point — a named network endpoint attached to a bucket
 * with its own policy, public-access-block settings, and optional VPC
 * restriction. Use access points to manage shared-dataset access at scale
 * instead of maintaining one giant bucket policy.
 * ### Creating Access Points
 * **Example:** Internet access point on a bucket
 * ```typescript
 * import * as S3 from "alchemy/AWS/S3";
 * import * as S3Control from "alchemy/AWS/S3Control";
 *
 * const bucket = yield* S3.Bucket("data", {});
 * const accessPoint = yield* S3Control.AccessPoint("data-ap", {
 *   bucket: bucket.bucketName,
 * });
 * ```
 *
 * **Example:** VPC-only access point
 * ```typescript
 * const accessPoint = yield* S3Control.AccessPoint("internal-ap", {
 *   bucket: bucket.bucketName,
 *   vpcConfiguration: { vpcId: vpc.vpcId },
 * });
 * ```
 *
 * **Example:** Access point with explicit public-access-block
 * ```typescript
 * const accessPoint = yield* S3Control.AccessPoint("locked-ap", {
 *   bucket: bucket.bucketName,
 *   publicAccessBlock: {
 *     blockPublicAcls: true,
 *     ignorePublicAcls: true,
 *     blockPublicPolicy: true,
 *     restrictPublicBuckets: true,
 *   },
 *   tags: { team: "data" },
 * });
 * ```
 *
 * ### Granting Access
 * **Example:** Attach a policy to the access point
 * ```typescript
 * yield* S3Control.AccessPointPolicy("data-ap-policy", {
 *   accessPointName: accessPoint.accessPointName,
 *   policy: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { AWS: `arn:aws:iam::${accountId}:role/reader` },
 *         Action: ["s3:GetObject"],
 *         Resource: [Output.interpolate`${accessPoint.accessPointArn}/object/*`],
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const AccessPoint: import("../../Resource.ts").ResourceClass<AccessPoint>;
export declare const AccessPointProvider: () => import("effect/Layer").Layer<Provider.Provider<AccessPoint>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=AccessPoint.d.ts.map