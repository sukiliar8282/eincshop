import * as s3control from "@distilled.cloud/aws/s3-control";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment, type AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface MultiRegionAccessPointProps {
    /**
     * Name of the Multi-Region Access Point (3-50 characters, lowercase
     * letters, numbers and hyphens). If omitted, a unique name is generated
     * from the app, stage and logical ID.
     *
     * Changing the name replaces the Multi-Region Access Point.
     * @default ${app}-${stage}-${id}
     */
    multiRegionAccessPointName?: string;
    /**
     * The buckets (at most one per region, up to 20 regions) the
     * Multi-Region Access Point routes requests to.
     *
     * Changing the regions replaces the Multi-Region Access Point.
     */
    regions: {
        /** Name of the bucket in one of the member regions. */
        bucket: string;
        /** Account ID that owns the bucket, for cross-account buckets. */
        bucketAccountId?: string;
    }[];
    /**
     * Block-public-access settings. AWS defaults every flag to `true` for
     * Multi-Region Access Points when omitted.
     *
     * Changing these settings replaces the Multi-Region Access Point.
     */
    publicAccessBlock?: {
        /** Block new public ACLs and uploading public objects. @default true */
        blockPublicAcls?: boolean;
        /** Ignore all public ACLs. @default true */
        ignorePublicAcls?: boolean;
        /** Block new policies that grant public access. @default true */
        blockPublicPolicy?: boolean;
        /** Restrict public policies to AWS principals. @default true */
        restrictPublicBuckets?: boolean;
    };
}
export interface MultiRegionAccessPoint extends Resource<"AWS.S3Control.MultiRegionAccessPoint", MultiRegionAccessPointProps, {
    /**
     * Name of the Multi-Region Access Point.
     */
    multiRegionAccessPointName: string;
    /**
     * ARN of the Multi-Region Access Point (regionless, alias-addressed).
     */
    multiRegionAccessPointArn: string;
    /**
     * The S3-assigned alias of the Multi-Region Access Point. Requests are
     * addressed to `${alias}.accesspoint.s3-global.amazonaws.com`.
     */
    alias: string | undefined;
    /**
     * Provisioning status of the Multi-Region Access Point at the time of
     * the last deploy (`READY` once fully provisioned).
     */
    status: s3control.MultiRegionAccessPointStatus | undefined;
    /**
     * AWS account ID that owns the Multi-Region Access Point.
     */
    accountId: AccountID;
}, never, Providers> {
}
/**
 * An Amazon S3 Multi-Region Access Point — a single global endpoint that
 * routes requests to buckets in multiple regions over the AWS global
 * network.
 *
 * Provisioning is asynchronous and slow (several minutes); the provider
 * submits the request and waits until the access point reaches `READY`.
 * All control-plane requests are routed through `us-west-2`, as required
 * by the Multi-Region Access Point API.
 * ### Creating Multi-Region Access Points
 * **Example:** Route between two regional buckets
 * ```typescript
 * import * as S3Control from "alchemy/AWS/S3Control";
 *
 * const mrap = yield* S3Control.MultiRegionAccessPoint("global", {
 *   regions: [
 *     { bucket: usWestBucket.bucketName },
 *     { bucket: euCentralBucket.bucketName },
 *   ],
 * });
 * ```
 *
 * **Example:** Single-region Multi-Region Access Point
 * ```typescript
 * const mrap = yield* S3Control.MultiRegionAccessPoint("global", {
 *   regions: [{ bucket: bucket.bucketName }],
 * });
 * ```
 *
 * @resource
 */
export declare const MultiRegionAccessPoint: import("../../Resource.ts").ResourceClass<MultiRegionAccessPoint>;
declare const MultiRegionAccessPointNotReady_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "MultiRegionAccessPointNotReady";
} & Readonly<A>;
/**
 * Raised while a Multi-Region Access Point is still provisioning — retried
 * by {@link retryWhileMrapTransitions} until it reaches `READY`.
 */
export declare class MultiRegionAccessPointNotReady extends MultiRegionAccessPointNotReady_base<{
    name: string;
    status: string | undefined;
}> {
}
declare const MultiRegionAccessPointNotDeleted_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "MultiRegionAccessPointNotDeleted";
} & Readonly<A>;
/**
 * Raised while a Multi-Region Access Point deletion is still in flight —
 * retried by {@link retryWhileMrapTransitions} until the report disappears.
 */
export declare class MultiRegionAccessPointNotDeleted extends MultiRegionAccessPointNotDeleted_base<{
    name: string;
    status: string | undefined;
}> {
}
export declare const MultiRegionAccessPointProvider: () => import("effect/Layer").Layer<Provider.Provider<MultiRegionAccessPoint>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=MultiRegionAccessPoint.d.ts.map