import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * Authorization mode for a service network. `NONE` allows all traffic;
 * `AWS_IAM` requires an auth policy.
 */
export type ServiceNetworkAuthType = "NONE" | "AWS_IAM";
export interface ServiceNetworkProps {
    /**
     * Name of the service network. If omitted, a unique name is generated.
     * Immutable — changing it replaces the resource.
     */
    name?: string;
    /**
     * Authorization type for the network.
     * @default "NONE"
     */
    authType?: ServiceNetworkAuthType;
    /**
     * User-defined tags to apply to the service network.
     */
    tags?: Record<string, string>;
}
export interface ServiceNetwork extends Resource<"AWS.VpcLattice.ServiceNetwork", ServiceNetworkProps, {
    /**
     * Service-assigned unique ID of the service network.
     */
    serviceNetworkId: string;
    /**
     * ARN of the service network.
     */
    serviceNetworkArn: string;
    /**
     * Physical name of the service network.
     */
    name: string;
    /**
     * Effective authorization type.
     */
    authType: ServiceNetworkAuthType;
    /**
     * Current tags reported for the service network.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon VPC Lattice service network — the logical boundary that connects
 * services and VPCs into one application network. Cheap control-plane resource
 * with no per-hour charge until VPCs or services are associated.
 *
 * ### Creating Service Networks
 * **Example:** Basic Service Network
 * ```typescript
 * const network = yield* ServiceNetwork("AppNetwork", {});
 * ```
 *
 * **Example:** IAM-Authorized Network
 * ```typescript
 * const network = yield* ServiceNetwork("SecureNetwork", {
 *   authType: "AWS_IAM",
 *   tags: { Environment: "prod" },
 * });
 * ```
 *
 * @resource
 */
export declare const ServiceNetwork: import("../../Resource.ts").ResourceClass<ServiceNetwork>;
export declare const ServiceNetworkProvider: () => import("effect/Layer").Layer<Provider.Provider<ServiceNetwork>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ServiceNetwork.d.ts.map