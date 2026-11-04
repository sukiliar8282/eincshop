import * as lambdacore from "@distilled.cloud/aws/lambda-core";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface NetworkConnectorProps {
    /**
     * A unique name for the network connector within your account and Region.
     * Must be 1-64 characters of letters, numbers, hyphens, or underscores.
     * If omitted, a unique name is generated. Changing the name replaces the
     * connector.
     */
    name?: string;
    /**
     * The IDs of the VPC subnets in which the connector provisions elastic
     * network interfaces (ENIs). These determine which VPC the connector routes
     * egress traffic into.
     */
    subnetIds: string[];
    /**
     * The IDs of the security groups applied to the connector's elastic network
     * interfaces.
     */
    securityGroupIds?: string[];
    /**
     * The IP addressing mode for the connector's egress path.
     * @default "IPv4"
     */
    networkProtocol?: lambdacore.NetworkProtocol;
    /**
     * The Lambda compute resource types that may attach to this connector.
     * @default ["MicroVm"]
     */
    associatedComputeResourceTypes?: lambdacore.ComputeResourceType[];
    /**
     * The ARN of the IAM role that Lambda assumes to manage elastic network
     * interfaces in your VPC. The role needs `ec2:CreateNetworkInterface` and
     * the related describe/delete permissions.
     */
    operatorRole?: string;
    /**
     * Tags to apply to the network connector. Tags are set at creation time and
     * cannot be changed afterwards (the API exposes no tagging operations).
     */
    tags?: Record<string, string>;
}
export interface NetworkConnector extends Resource<"AWS.Lambda.NetworkConnector", NetworkConnectorProps, {
    /**
     * The Amazon Resource Name (ARN) of the network connector.
     */
    networkConnectorArn: string;
    /**
     * The unique ID of the network connector.
     */
    networkConnectorId: string;
    /**
     * The name of the network connector.
     */
    name: string;
    /**
     * The current state of the network connector (e.g. `ACTIVE`, `PENDING`,
     * `FAILED`).
     */
    state: lambdacore.NetworkConnectorState;
    /**
     * The ARN of the IAM operator role, if one was configured.
     */
    operatorRole?: string;
    /**
     * The subnet IDs the connector provisions ENIs in.
     */
    subnetIds?: string[];
    /**
     * The security group IDs applied to the connector's ENIs.
     */
    securityGroupIds?: string[];
    /**
     * The IP addressing mode of the connector's egress path.
     */
    networkProtocol?: lambdacore.NetworkProtocol;
    /**
     * The compute resource types associated with the connector.
     */
    associatedComputeResourceTypes?: lambdacore.ComputeResourceType[];
    /**
     * The monotonic version of the connector, incremented on each update.
     */
    version?: number;
    /**
     * The timestamp of the connector's most recent modification (ISO 8601).
     */
    lastModified?: string;
}, never, Providers> {
}
/**
 * A Lambda network connector that gives Lambda compute resources — notably
 * {@link MicrovmImage} MicroVMs — a managed egress path into your VPC. The
 * connector provisions elastic network interfaces (ENIs) in the subnets you
 * specify so workloads can reach private resources such as databases, caches,
 * and internal APIs.
 *
 * Creation is asynchronous: the connector starts in `PENDING` while ENIs are
 * provisioned (this can take several minutes) and the provider waits until it
 * reaches `ACTIVE`. The connector name is immutable, so renaming it replaces the
 * connector; the VPC configuration and operator role can be updated in place.
 *
 * ### Creating a Network Connector
 * **Example:** VPC Egress Connector
 * ```typescript
 * const connector = yield* AWS.Lambda.NetworkConnector("Egress", {
 *   subnetIds: [subnetA.subnetId, subnetB.subnetId],
 *   securityGroupIds: [securityGroup.groupId],
 *   operatorRole: role.roleArn,
 * });
 * ```
 *
 * ### Dual-Stack Networking
 * **Example:** IPv4 + IPv6 Egress
 * ```typescript
 * const connector = yield* AWS.Lambda.NetworkConnector("DualStack", {
 *   subnetIds: [subnet.subnetId],
 *   securityGroupIds: [securityGroup.groupId],
 *   networkProtocol: "DualStack",
 * });
 * ```
 *
 * ### Using a Connector with MicroVMs
 * A connector is the producer; a {@link MicrovmImage} (or a per-run
 * `RunMicrovm` call) is the consumer. Reference it by ARN in
 * `egressNetworkConnectors`.
 * **Example:** Image-level Egress
 * ```typescript
 * const image = yield* AWS.Lambda.MicrovmImage("Sandbox", {
 *   main: import.meta.filename,
 *   buildRole,
 *   egressNetworkConnectors: [connector.networkConnectorArn],
 * });
 * ```
 *
 * @resource
 */
export declare const NetworkConnector: import("../../Resource.ts").ResourceClass<NetworkConnector>;
export declare const NetworkConnectorProvider: () => import("effect/Layer").Layer<Provider.Provider<NetworkConnector>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=NetworkConnector.d.ts.map