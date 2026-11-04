import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface PodIdentityAssociationProps {
    /**
     * Target cluster name.
     */
    clusterName: Input<string>;
    /**
     * Kubernetes namespace that owns the service account.
     */
    namespace: string;
    /**
     * Kubernetes service account name.
     */
    serviceAccount: string;
    /**
     * IAM role ARN assumed by pods for this association.
     */
    roleArn: Input<string>;
    /**
     * Disable session tags for the issued credentials.
     */
    disableSessionTags?: boolean;
    /**
     * Optional target role ARN for chained role assumption.
     */
    targetRoleArn?: Input<string>;
    /**
     * Optional inline session policy JSON.
     */
    policy?: string;
    /**
     * User-defined tags to apply to the association.
     */
    tags?: Record<string, string>;
}
export interface PodIdentityAssociation extends Resource<"AWS.EKS.PodIdentityAssociation", PodIdentityAssociationProps, {
    /** The ARN of the pod identity association. */
    associationArn: string;
    /** The ID of the pod identity association. */
    associationId: string;
    /** The name of the EKS cluster the association belongs to. */
    clusterName: string;
    /** The Kubernetes namespace of the bound service account. */
    namespace: string;
    /** The name of the Kubernetes service account bound to the role. */
    serviceAccount: string;
    /** The ARN of the IAM role pods assume via the association. */
    roleArn: string;
    /** Whether EKS session tags are disabled on the assumed-role session. */
    disableSessionTags: boolean;
    /** The ARN of the target role for role chaining, if configured. */
    targetRoleArn: string | undefined;
    /** The external ID EKS uses when assuming the target role. */
    externalId: string | undefined;
    /** The ARN of the add-on that owns the association, if add-on managed. */
    ownerArn: string | undefined;
    /** The inline policy document attached to the generated role, if any. */
    policy: string | undefined;
    /** The tags applied to the association. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon EKS pod identity association that binds a service account to an IAM role.
 *
 * `PodIdentityAssociation` is the canonical workload-identity resource for EKS
 * clusters that use EKS Pod Identity instead of IRSA.
 * ### Managing Pod Identity
 * **Example:** Bind a Service Account to a Role
 * ```typescript
 * const association = yield* PodIdentityAssociation("ApiIdentity", {
 *   clusterName: cluster.clusterName,
 *   namespace: "default",
 *   serviceAccount: "api",
 *   roleArn: podRole.roleArn,
 * });
 * ```
 *
 * @resource
 */
export declare const PodIdentityAssociation: import("../../Resource.ts").ResourceClass<PodIdentityAssociation>;
export declare const PodIdentityAssociationProvider: () => import("effect/Layer").Layer<Provider.Provider<PodIdentityAssociation>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=PodIdentityAssociation.d.ts.map