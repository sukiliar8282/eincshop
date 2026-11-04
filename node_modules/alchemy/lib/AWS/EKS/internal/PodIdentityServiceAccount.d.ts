/**
 * Internal composite: a Kubernetes service account (bound onto the cluster)
 * wired to EKS Pod Identity through an IAM role + `PodIdentityAssociation`.
 * Un-exported — the workload platforms (`Kubernetes.Deployment`,
 * `Kubernetes.Job`) provision the same triple through the aws-eks
 * adapter; this helper remains for composition-style stacks that assemble
 * the pieces from resources.
 */
import * as Effect from "effect/Effect";
import type { Input } from "../../../Input.ts";
import type { PolicyDocument } from "../../IAM/Policy.ts";
import { Role, type RoleArn, type Role as RoleResource } from "../../IAM/Role.ts";
import type { Cluster } from "../Cluster.ts";
import { PodIdentityAssociation, type PodIdentityAssociation as PodIdentityAssociationResource } from "../PodIdentityAssociation.ts";
import { type ClusterObjectRef } from "./ClusterObject.ts";
export interface PodIdentityServiceAccountProps {
    /** Target EKS cluster. */
    cluster: Cluster;
    /** Namespace name or namespace helper result. */
    namespace: string | {
        name: string;
    } | ClusterObjectRef;
    /** Optional explicit service account name. Defaults to the logical id. */
    serviceAccountName?: string;
    /** Existing IAM role ARN to use for pod identity. */
    roleArn?: string;
    /** Optional role name when Alchemy creates the IAM role. */
    roleName?: string;
    /** Managed policy ARNs to attach when creating the IAM role. */
    managedPolicyArns?: string[];
    /** Inline policies to attach when creating the IAM role. */
    inlinePolicies?: Record<string, PolicyDocument>;
    /** Optional role description when Alchemy creates the IAM role. */
    description?: string;
    /** Disable session tags for the pod identity association. */
    disableSessionTags?: boolean;
    /** Optional target role ARN for chained role assumption. */
    targetRoleArn?: string;
    /** Optional inline session policy JSON. */
    policy?: string;
    /** Labels applied to the Kubernetes service account. */
    labels?: Record<string, string>;
    /** Annotations applied to the Kubernetes service account. */
    annotations?: Record<string, string>;
    /** Tags applied to AWS resources. */
    tags?: Record<string, string>;
}
export interface PodIdentityServiceAccountResources {
    /** Reference to the created Kubernetes service account. */
    serviceAccount: ClusterObjectRef;
    /** The Pod Identity association binding the role to the service account. */
    podIdentityAssociation: PodIdentityAssociationResource;
    /** The generated IAM role, or `undefined` when `roleArn` was supplied. */
    role: RoleResource | undefined;
    /** The ARN of the IAM role pods assume (generated or supplied). */
    roleArn: Input<string> | RoleArn;
}
export declare const PodIdentityServiceAccount: (id: string, props: PodIdentityServiceAccountProps) => Effect.Effect<{
    serviceAccount: {
        cluster: Cluster;
        apiVersion: string;
        kind: string;
        name: string;
        namespace: string | undefined;
        key: string;
        object: {
            apiVersion: string;
            kind: string;
            metadata: {
                name: string;
                namespace: string | undefined;
                labels: Record<string, string> | undefined;
                annotations: Record<string, string> | undefined;
            };
        };
    };
    podIdentityAssociation: PodIdentityAssociation;
    role: Role | undefined;
    roleArn: string | import("../../../Output.ts").Output<`arn:aws:iam::${string}:role/${string}`, never>;
}, never, import("../../Providers.ts").Providers>;
//# sourceMappingURL=PodIdentityServiceAccount.d.ts.map