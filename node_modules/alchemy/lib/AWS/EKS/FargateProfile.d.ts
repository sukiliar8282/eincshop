import * as eks from "@distilled.cloud/aws/eks";
import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface FargateProfileProps {
    /**
     * Name of the EKS cluster that owns this Fargate profile.
     */
    clusterName: Input<string>;
    /**
     * Name of the Fargate profile. If omitted, a unique name is generated.
     */
    fargateProfileName?: string;
    /**
     * ARN of the pod execution IAM role that Fargate pods assume. The role must
     * trust `eks-fargate-pods.amazonaws.com`. Changing this replaces the profile.
     */
    podExecutionRoleArn: Input<string>;
    /**
     * Selectors (namespace + optional labels) that decide which pods run on
     * Fargate. Changing this replaces the profile.
     */
    selectors: eks.FargateProfileSelector[];
    /**
     * Subnet IDs to run Fargate pods in. **Fargate pods require PRIVATE subnets
     * only** — a subnet that auto-assigns a public IP is rejected by EKS. Changing
     * this replaces the profile.
     */
    subnets?: Input<string>[];
    /**
     * User-defined tags to apply to the Fargate profile.
     */
    tags?: Record<string, string>;
}
export interface FargateProfile extends Resource<"AWS.EKS.FargateProfile", FargateProfileProps, {
    /** The name of the Fargate profile. */
    fargateProfileName: string;
    /** The ARN of the Fargate profile. */
    fargateProfileArn: string;
    /** The name of the EKS cluster the profile belongs to. */
    clusterName: string;
    /** The profile status (e.g. `CREATING`, `ACTIVE`). */
    status: eks.FargateProfileStatus;
    /** The ARN of the pod execution role used by pods matched by the profile. */
    podExecutionRoleArn: string;
    /** The IDs of the (private) subnets pods are launched into. */
    subnets: string[];
    /** The namespace/label selectors that route pods onto Fargate. */
    selectors: eks.FargateProfileSelector[];
    /** The tags applied to the Fargate profile. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon EKS Fargate profile — declares which pods (by namespace + labels)
 * run on AWS Fargate serverless compute instead of on EC2 nodes.
 *
 * Fargate profiles are immutable except for tags: any change to selectors, the
 * pod execution role, or subnets forces a replacement. Create and delete are
 * asynchronous (`CREATING` → `ACTIVE`, `DELETING` → gone, ~1–2 min each) and the
 * provider waits for the terminal state. EKS allows only one Fargate profile per
 * cluster to be creating or deleting at a time, so the provider retries the
 * `ResourceInUseException` that surfaces when a peer profile operation is in
 * flight.
 *
 * **Fargate pods must run in private subnets** — pass private subnet IDs only.
 * ### Creating Fargate Profiles
 * **Example:** Run the `default` Namespace on Fargate
 * ```typescript
 * const profile = yield* FargateProfile("DefaultFargate", {
 *   clusterName: cluster.clusterName,
 *   podExecutionRoleArn: podRole.roleArn,
 *   subnets: network.privateSubnetIds,
 *   selectors: [{ namespace: "default" }],
 * });
 * ```
 *
 * **Example:** Select Pods by Namespace and Labels
 * ```typescript
 * const profile = yield* FargateProfile("BatchFargate", {
 *   clusterName: cluster.clusterName,
 *   podExecutionRoleArn: podRole.roleArn,
 *   subnets: network.privateSubnetIds,
 *   selectors: [
 *     { namespace: "batch", labels: { compute: "fargate" } },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const FargateProfile: import("../../Resource.ts").ResourceClass<FargateProfile>;
export declare const FargateProfileProvider: () => import("effect/Layer").Layer<Provider.Provider<FargateProfile>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=FargateProfile.d.ts.map