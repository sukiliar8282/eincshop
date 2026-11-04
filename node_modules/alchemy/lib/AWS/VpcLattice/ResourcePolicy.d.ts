import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { PolicyDocument } from "../IAM/Policy.ts";
import type { Providers } from "../Providers.ts";
export interface ResourcePolicyProps {
    /**
     * The ARN of the service network or service the resource policy is attached
     * to. Immutable — changing it replaces the resource.
     */
    resourceArn: string;
    /**
     * The resource-based permission policy, either as a structured
     * {@link PolicyDocument} or a raw JSON string (escape hatch). Must contain
     * the same actions and condition statements as the RAM permission for
     * sharing services and service networks.
     */
    policy: PolicyDocument | string;
}
export interface ResourcePolicy extends Resource<"AWS.VpcLattice.ResourcePolicy", ResourcePolicyProps, {
    /**
     * ARN of the service network or service the policy is attached to.
     */
    resourceArn: string;
    /**
     * The attached policy document as a JSON string.
     */
    policy: string;
}, never, Providers> {
}
/**
 * A resource-based permission policy on a VPC Lattice service or service
 * network — the policy AWS RAM manages when sharing Lattice resources across
 * accounts, attachable directly for fine-grained cross-account control.
 *
 * ### Attaching Resource Policies
 * **Example:** Allow Another Account to Associate with a Service Network
 * ```typescript
 * const network = yield* ServiceNetwork("SharedNetwork", {});
 * const policy = yield* ResourcePolicy("SharePolicy", {
 *   resourceArn: network.serviceNetworkArn,
 *   policy: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { AWS: "arn:aws:iam::123456789012:root" },
 *         Action: [
 *           "vpc-lattice:CreateServiceNetworkVpcAssociation",
 *           "vpc-lattice:CreateServiceNetworkServiceAssociation",
 *           "vpc-lattice:GetServiceNetwork",
 *         ],
 *         Resource: network.serviceNetworkArn,
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const ResourcePolicy: import("../../Resource.ts").ResourceClass<ResourcePolicy>;
export declare const ResourcePolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<ResourcePolicy>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ResourcePolicy.d.ts.map