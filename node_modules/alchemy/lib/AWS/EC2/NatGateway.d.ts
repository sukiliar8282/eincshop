import * as ec2 from "@distilled.cloud/aws/ec2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { AccountID } from "../Environment.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
import type { AllocationId } from "./EIP.ts";
import type { SubnetId } from "./Subnet.ts";
export type NatGatewayId<ID extends string = string> = `nat-${ID}`;
export declare const NatGatewayId: <ID extends string>(id: ID) => ID & NatGatewayId<ID>;
export type NatGatewayArn = `arn:aws:ec2:${RegionID}:${AccountID}:natgateway/${NatGatewayId}`;
export interface NatGatewayProps {
    /**
     * The subnet in which to create the NAT gateway.
     * For public NAT gateways, this must be a public subnet.
     */
    subnetId: SubnetId;
    /**
     * The allocation ID of the Elastic IP address for the gateway.
     * Required for public NAT gateways.
     */
    allocationId?: AllocationId;
    /**
     * Indicates whether the NAT gateway supports public or private connectivity.
     * @default "public"
     */
    connectivityType?: ec2.ConnectivityType;
    /**
     * The private IPv4 address to assign to the NAT gateway.
     * If you don't provide an address, a private IPv4 address will be automatically assigned.
     */
    privateIpAddress?: string;
    /**
     * Secondary allocation IDs for additional private IP addresses.
     * Only valid for private NAT gateways.
     */
    secondaryAllocationIds?: AllocationId[];
    /**
     * Secondary private IPv4 addresses.
     * Only valid for private NAT gateways.
     */
    secondaryPrivateIpAddresses?: string[];
    /**
     * The number of secondary private IPv4 addresses to assign.
     * Only valid for private NAT gateways.
     */
    secondaryPrivateIpAddressCount?: number;
    /**
     * Tags to assign to the NAT gateway.
     */
    tags?: Record<string, string>;
}
export interface NatGateway extends Resource<"AWS.EC2.NatGateway", NatGatewayProps, {
    /**
     * The ID of the NAT gateway.
     */
    natGatewayId: NatGatewayId;
    /**
     * The Amazon Resource Name (ARN) of the NAT gateway.
     */
    natGatewayArn: `arn:aws:ec2:${RegionID}:${AccountID}:natgateway/${string}`;
    /**
     * The ID of the subnet in which the NAT gateway is located.
     */
    subnetId: SubnetId;
    /**
     * The ID of the VPC in which the NAT gateway is located.
     */
    vpcId: string;
    /**
     * The current state of the NAT gateway.
     */
    state: ec2.NatGatewayState;
    /**
     * The connectivity type of the NAT gateway.
     */
    connectivityType: ec2.ConnectivityType;
    /**
     * The Elastic IP address associated with the NAT gateway (for public NAT gateways).
     */
    publicIp?: string;
    /**
     * The private IP address associated with the NAT gateway.
     */
    privateIp?: string;
    /**
     * Information about the IP addresses and network interface associated with the NAT gateway.
     */
    natGatewayAddresses?: Array<{
        allocationId?: string;
        networkInterfaceId?: string;
        privateIp?: string;
        publicIp?: string;
        associationId?: string;
        isPrimary?: boolean;
        failureMessage?: string;
        status?: ec2.NatGatewayAddressStatus;
    }>;
    /**
     * If the NAT gateway could not be created, specifies the error code for the failure.
     */
    failureCode?: string;
    /**
     * If the NAT gateway could not be created, specifies the error message for the failure.
     */
    failureMessage?: string;
    /**
     * The date and time the NAT gateway was created.
     */
    createTime?: string;
    /**
     * The date and time the NAT gateway was deleted, if applicable.
     */
    deleteTime?: string;
}, never, Providers> {
}
/**
 * A NAT gateway that lets instances in a private subnet reach the internet
 * (and other AWS services) while preventing unsolicited inbound connections.
 *
 * The gateway lives in the subnet given by `subnetId`, and its
 * `connectivityType` decides how it connects: a `"public"` gateway must sit in a
 * *public* subnet and requires an Elastic IP via `allocationId`, while a
 * `"private"` gateway has no public address and is used for VPC-to-VPC routing.
 * A NAT gateway only carries traffic once a `Route` sends `0.0.0.0/0` from the
 * private subnet's route table to it. Core properties (`subnetId`,
 * `connectivityType`, `allocationId`) are immutable, so changing them replaces
 * the gateway.
 *
 * ### Public NAT Gateways
 * Public gateways translate private addresses to a stable public IP, so they
 * must be placed in a public subnet (one with a route to an internet gateway)
 * and given an Elastic IP allocation.
 * **Example:** Public NAT Gateway with an Elastic IP
 * ```typescript
 * const eip = yield* AWS.EC2.EIP("NatEip", {});
 *
 * const natGateway = yield* AWS.EC2.NatGateway("NatGateway", {
 *   subnetId: publicSubnet.subnetId,
 *   allocationId: eip.allocationId,
 *   connectivityType: "public",
 *   tags: { Name: "production-nat" },
 * });
 * ```
 * Allocating the EIP first and passing its `allocationId` gives the gateway a
 * fixed public IP. `connectivityType` defaults to `"public"`, so it can be
 * omitted; this is the standard way to give private instances outbound internet
 * access.
 *
 * ### Private NAT Gateways
 * Private gateways have no public IP and route traffic between VPCs or to
 * on-premises networks without exposing it to the internet.
 * **Example:** Private NAT Gateway with a Fixed Private IP
 * ```typescript
 * const natGateway = yield* AWS.EC2.NatGateway("PrivateNat", {
 *   subnetId: privateSubnet.subnetId,
 *   connectivityType: "private",
 *   privateIpAddress: "10.0.10.10",
 * });
 * ```
 * Omitting `allocationId` and setting `connectivityType: "private"` creates a
 * gateway with no public address; `privateIpAddress` pins it to a specific
 * address in the subnet instead of letting AWS choose one automatically.
 *
 * **Example:** Private NAT Gateway with Secondary Addresses
 * ```typescript
 * const natGateway = yield* AWS.EC2.NatGateway("ScaledNat", {
 *   subnetId: privateSubnet.subnetId,
 *   connectivityType: "private",
 *   secondaryPrivateIpAddressCount: 3,
 * });
 * ```
 * Secondary private addresses — via `secondaryPrivateIpAddressCount`,
 * `secondaryPrivateIpAddresses`, or `secondaryAllocationIds` — raise the number
 * of simultaneous connections a private gateway can sustain to busy
 * destinations, which is only valid for private gateways.
 *
 * ### Routing Private Traffic
 * **Example:** Default Route Through the NAT Gateway
 * ```typescript
 * const natRoute = yield* AWS.EC2.Route("NatRoute", {
 *   routeTableId: privateRouteTable.routeTableId,
 *   destinationCidrBlock: "0.0.0.0/0",
 *   natGatewayId: natGateway.natGatewayId,
 * });
 * ```
 * Without a route the gateway is inert; this entry sends all outbound traffic
 * from the private subnet's route table through the gateway so private instances
 * can reach the internet.
 *
 * @resource
 */
export declare const NatGateway: import("../../Resource.ts").ResourceClass<NatGateway>;
export declare const NatGatewayProvider: () => import("effect/Layer").Layer<Provider.Provider<NatGateway>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=NatGateway.d.ts.map