import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import { type PolicyDocument } from "../IAM/Policy.ts";
import type { Providers } from "../Providers.ts";
export interface AccessPointPolicyProps {
    /**
     * Name of the access point the policy is attached to.
     *
     * Changing the access point replaces the policy.
     */
    accessPointName: string;
    /**
     * The resource policy granting access through the access point, as a
     * typed {@link PolicyDocument} or a raw JSON string (escape hatch /
     * adoption). Object-level actions target `${accessPointArn}/object/${key}`.
     */
    policy: PolicyDocument | string;
}
export interface AccessPointPolicy extends Resource<"AWS.S3Control.AccessPointPolicy", AccessPointPolicyProps, {
    /**
     * Name of the access point the policy is attached to.
     */
    accessPointName: string;
}, never, Providers> {
}
/**
 * The resource policy of an S3 Access Point. Grants principals access to
 * objects through the access point — the delegated replacement for a giant
 * shared bucket policy.
 *
 * Note that the underlying bucket must delegate access control to the access
 * point (or the principals must also be allowed by the bucket policy).
 * ### Attaching a Policy
 * **Example:** Allow a role to read objects through the access point
 * ```typescript
 * import * as S3Control from "alchemy/AWS/S3Control";
 *
 * const accessPoint = yield* S3Control.AccessPoint("data-ap", {
 *   bucket: bucket.bucketName,
 * });
 *
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
export declare const AccessPointPolicy: import("../../Resource.ts").ResourceClass<AccessPointPolicy>;
export declare const AccessPointPolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<AccessPointPolicy>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=AccessPointPolicy.d.ts.map