import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { PolicyDocument } from "../IAM/Policy.ts";
import type { Providers } from "../Providers.ts";
export interface RegistryPolicyProps {
    /**
     * The registry permissions policy — grants other AWS accounts registry
     * level permissions such as `ecr:ReplicateImage` (cross-account
     * replication) or `ecr:CreateRepository`. Accepts either a structured IAM
     * {@link PolicyDocument} or a raw JSON string (escape hatch / adoption of
     * an existing policy).
     */
    policy: PolicyDocument | string;
}
export interface RegistryPolicy extends Resource<"AWS.ECR.RegistryPolicy", RegistryPolicyProps, {
    /** The AWS account ID of the registry. */
    registryId: string;
    /** The JSON registry permissions policy as stored by ECR. */
    policy: string;
}, never, Providers> {
}
/**
 * The permissions policy for a private Amazon ECR registry — an
 * account/region **singleton** used to grant other AWS accounts
 * registry-level permissions (most commonly `ecr:ReplicateImage` when
 * configuring cross-account replication).
 * ### Managing the Registry Policy
 * **Example:** Allow Cross-Account Replication
 * ```typescript
 * const policy = yield* RegistryPolicy("ReplicationPolicy", {
 *   policy: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Sid: "AllowReplication",
 *         Effect: "Allow",
 *         Principal: { AWS: `arn:aws:iam::${sourceAccountId}:root` },
 *         Action: ["ecr:ReplicateImage"],
 *         Resource: `arn:aws:ecr:us-east-1:${accountId}:repository/*`,
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const RegistryPolicy: import("../../Resource.ts").ResourceClass<RegistryPolicy>;
export declare const RegistryPolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<RegistryPolicy>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=RegistryPolicy.d.ts.map