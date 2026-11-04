import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { PolicyDocument } from "../IAM/Policy.ts";
import type { Providers } from "../Providers.ts";
export interface AuthPolicyProps {
    /**
     * The ID or ARN of the service network or service the auth policy applies
     * to. Immutable — changing it replaces the resource.
     */
    resourceIdentifier: string;
    /**
     * The IAM auth policy controlling access to the service network or service,
     * either as a structured {@link PolicyDocument} or a raw JSON string
     * (escape hatch).
     */
    policy: PolicyDocument | string;
}
export interface AuthPolicy extends Resource<"AWS.VpcLattice.AuthPolicy", AuthPolicyProps, {
    /**
     * ID or ARN of the service network or service the policy is attached to.
     */
    resourceIdentifier: string;
    /**
     * The attached policy document as a JSON string.
     */
    policy: string;
    /**
     * Policy state reported by the API (`Active` or `Inactive` — `Inactive`
     * when the target's `authType` is `NONE`).
     */
    state: string | undefined;
}, never, Providers> {
}
/**
 * An auth policy for a VPC Lattice service network or service — the IAM
 * resource policy evaluated on every request when the target's `authType`
 * is `AWS_IAM`.
 *
 * ### Attaching Auth Policies
 * **Example:** Allow Authenticated Invoke on a Service Network
 * ```typescript
 * const network = yield* ServiceNetwork("SecureNetwork", {
 *   authType: "AWS_IAM",
 * });
 * const authPolicy = yield* AuthPolicy("NetworkAuthPolicy", {
 *   resourceIdentifier: network.serviceNetworkId,
 *   policy: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { AWS: "*" },
 *         Action: ["vpc-lattice-svcs:Invoke"],
 *         Resource: "*",
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * **Example:** Raw JSON Escape Hatch
 * ```typescript
 * const authPolicy = yield* AuthPolicy("ServiceAuthPolicy", {
 *   resourceIdentifier: service.serviceId,
 *   policy: JSON.stringify({
 *     Version: "2012-10-17",
 *     Statement: [{ Effect: "Allow", Principal: "*", Action: "vpc-lattice-svcs:Invoke", Resource: "*" }],
 *   }),
 * });
 * ```
 *
 * @resource
 */
export declare const AuthPolicy: import("../../Resource.ts").ResourceClass<AuthPolicy>;
export declare const AuthPolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<AuthPolicy>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=AuthPolicy.d.ts.map