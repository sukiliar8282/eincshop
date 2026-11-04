import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface VpcEndpointProps {
    /**
     * Name of the VPC endpoint (3-32 characters, lowercase). Changing the name
     * replaces the endpoint.
     * @default a generated physical name
     */
    endpointName?: string;
    /**
     * The ID of the VPC from which the endpoint accesses OpenSearch Serverless.
     * Changing the VPC replaces the endpoint.
     */
    vpcId: string;
    /**
     * The IDs of the subnets in which to create the interface endpoint's network
     * interfaces.
     */
    subnetIds: string[];
    /**
     * The IDs of the security groups to attach to the endpoint's network
     * interfaces.
     */
    securityGroupIds?: string[];
}
export interface VpcEndpoint extends Resource<"AWS.OpenSearchServerless.VpcEndpoint", VpcEndpointProps, {
    /**
     * Unique identifier of the VPC endpoint.
     */
    vpcEndpointId: string;
    /**
     * Name of the VPC endpoint.
     */
    endpointName: string;
    /**
     * Endpoint status (e.g. `ACTIVE`, `PENDING`, `DELETING`).
     */
    status?: string;
}, {}, Providers> {
}
/**
 * An Amazon OpenSearch Serverless-managed interface VPC endpoint. Creating one
 * lets resources in a VPC reach a collection privately (without traversing the
 * public internet), and lets a network {@link SecurityPolicy} restrict a
 * collection's access to only that endpoint. Creation is asynchronous — the
 * provider polls (bounded) until the endpoint reaches `ACTIVE`.
 *
 * ### Creating VPC Endpoints
 * **Example:** Interface Endpoint in a VPC
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const endpoint = yield* AWS.OpenSearchServerless.VpcEndpoint("Endpoint", {
 *   endpointName: "my-endpoint",
 *   vpcId: vpc.vpcId,
 *   subnetIds: [subnet.subnetId],
 *   securityGroupIds: [securityGroup.groupId],
 * });
 * ```
 *
 * @resource
 */
export declare const VpcEndpoint: import("../../Resource.ts").ResourceClass<VpcEndpoint>;
export declare const VpcEndpointProvider: () => import("effect/Layer").Layer<Provider.Provider<VpcEndpoint>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=VpcEndpoint.d.ts.map