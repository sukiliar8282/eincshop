import * as eks from "@distilled.cloud/aws/eks";
import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface AccessPolicyAssociation {
    /**
     * ARN of the AWS-managed EKS access policy.
     */
    policyArn: string;
    /**
     * Scope the policy applies to.
     */
    accessScope: eks.AccessScope;
}
export interface AccessEntryProps {
    /**
     * Target cluster name.
     */
    clusterName: Input<string>;
    /**
     * IAM principal ARN to grant access to.
     */
    principalArn: Input<string>;
    /**
     * Optional Kubernetes groups for the principal.
     */
    kubernetesGroups?: string[];
    /**
     * Optional username to map inside Kubernetes.
     */
    username?: string;
    /**
     * Entry type, such as `STANDARD`.
     */
    type?: string;
    /**
     * Exact set of EKS access policies associated with this entry.
     */
    accessPolicies?: AccessPolicyAssociation[];
    /**
     * User-defined tags to apply to the access entry.
     */
    tags?: Record<string, string>;
}
export interface AccessEntry extends Resource<"AWS.EKS.AccessEntry", AccessEntryProps, {
    /** The ARN of the access entry. */
    accessEntryArn: string;
    /** The name of the EKS cluster the entry grants access to. */
    clusterName: string;
    /** The IAM principal ARN the entry maps into the cluster. */
    principalArn: string;
    /** The Kubernetes groups the principal is mapped to. */
    kubernetesGroups: string[];
    /** The Kubernetes username the principal is mapped to. */
    username: string | undefined;
    /** The access entry type (e.g. `STANDARD`, `EC2_LINUX`, `FARGATE_LINUX`). */
    type: string | undefined;
    /** The EKS access policies associated with the entry. */
    accessPolicies: AccessPolicyAssociation[];
    /** The tags applied to the access entry. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon EKS access entry that grants an IAM principal access to a cluster.
 *
 * `AccessEntry` owns both the entry itself and the exact set of associated EKS
 * access policies, making cluster access explicit and updatable after initial
 * cluster bootstrap.
 * ### Managing Cluster Access
 * **Example:** Grant Read Access to a Role
 * ```typescript
 * const viewer = yield* AccessEntry("ViewerAccess", {
 *   clusterName: cluster.clusterName,
 *   principalArn: viewerRole.roleArn,
 *   accessPolicies: [
 *     {
 *       policyArn:
 *         "arn:aws:eks::aws:cluster-access-policy/AmazonEKSViewPolicy",
 *       accessScope: {
 *         type: "cluster",
 *       },
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const AccessEntry: import("../../Resource.ts").ResourceClass<AccessEntry>;
export declare const AccessEntryProvider: () => import("effect/Layer").Layer<Provider.Provider<AccessEntry>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=AccessEntry.d.ts.map