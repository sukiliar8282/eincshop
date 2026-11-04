import * as ec2 from "@distilled.cloud/aws/ec2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { AccountID } from "../Environment.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { RegionID } from "../Region.ts";
import type { Providers } from "../Providers.ts";
import type { SecurityGroupId } from "./SecurityGroup.ts";
import type { SubnetId } from "./Subnet.ts";
import type { VpcId } from "./Vpc.ts";
export type NetworkInterfaceId<ID extends string = string> = `eni-${ID}`;
export declare const NetworkInterfaceId: <ID extends string>(id: ID) => ID & NetworkInterfaceId<ID>;
export type NetworkInterfaceArn = `arn:aws:ec2:${RegionID}:${AccountID}:network-interface/${NetworkInterfaceId}`;
export interface NetworkInterfaceProps {
    /**
     * The ID of the subnet to create the network interface in. Required.
     * Changing it replaces the interface.
     */
    subnetId: SubnetId;
    /**
     * A description for the network interface. Mutable in place.
     */
    description?: string;
    /**
     * The primary private IPv4 address to assign. If omitted, AWS selects one
     * from the subnet range. Changing it replaces the interface.
     */
    privateIpAddress?: string;
    /**
     * Additional (secondary) private IPv4 addresses to assign at creation.
     */
    privateIpAddresses?: string[];
    /**
     * The security groups to associate with the interface. Mutable in place.
     */
    securityGroupIds?: SecurityGroupId[];
    /**
     * Whether source/destination checking is enabled. Disable it for NAT
     * instances and other appliances that forward traffic. Mutable in place.
     * @default true
     */
    sourceDestCheck?: boolean;
    /**
     * The type of network interface.
     * @default "interface"
     */
    interfaceType?: ec2.NetworkInterfaceCreationType;
    /**
     * Tags to assign to the network interface. Merged with alchemy auto-tags
     * (alchemy::stack, alchemy::stage, alchemy::id).
     */
    tags?: Record<string, string>;
}
export interface NetworkInterface extends Resource<"AWS.EC2.NetworkInterface", NetworkInterfaceProps, {
    /**
     * The ID of the network interface.
     */
    networkInterfaceId: NetworkInterfaceId;
    /**
     * The Amazon Resource Name (ARN) of the network interface.
     */
    networkInterfaceArn: NetworkInterfaceArn;
    /**
     * The ID of the subnet the interface is in.
     */
    subnetId: SubnetId;
    /**
     * The ID of the VPC the interface is in.
     */
    vpcId: VpcId;
    /**
     * The Availability Zone of the interface.
     */
    availabilityZone: string;
    /**
     * The primary private IPv4 address.
     */
    privateIpAddress?: string;
    /**
     * All private IPv4 addresses assigned to the interface.
     */
    privateIpAddresses: string[];
    /**
     * The MAC address of the interface.
     */
    macAddress?: string;
    /**
     * The security groups associated with the interface.
     */
    securityGroupIds: SecurityGroupId[];
    /**
     * Whether source/destination checking is enabled.
     */
    sourceDestCheck: boolean;
    /**
     * The current status of the interface.
     */
    status: ec2.NetworkInterfaceStatus;
    /**
     * The ID of the AWS account that owns the interface.
     */
    ownerId?: string;
}, never, Providers> {
}
/**
 * An Elastic Network Interface (ENI) — a virtual network card in a VPC subnet
 * with its own private IPs, MAC address, and security groups. Attach one to an
 * instance via a {@link NetworkInterfaceAttachment} for stable-IP and
 * multi-homing patterns.
 *
 * Changing `subnetId` or the primary `privateIpAddress` replaces the interface.
 * `description`, `securityGroupIds`, and `sourceDestCheck` are applied in place.
 *
 * ### Creating a Network Interface
 * **Example:** Basic ENI
 * ```typescript
 * const eni = yield* AWS.EC2.NetworkInterface("AppEni", {
 *   subnetId: subnet.subnetId,
 *   description: "stable IP for the app server",
 *   securityGroupIds: [securityGroup.groupId],
 * });
 * ```
 *
 * The interface gets a private IP from the subnet's range. Its IP survives
 * instance replacement — detach it from a failed instance and attach it to a
 * new one to keep the same address.
 *
 * ### Fixed Private IP
 * **Example:** ENI with a Fixed Private IP
 * ```typescript
 * const eni = yield* AWS.EC2.NetworkInterface("FixedIpEni", {
 *   subnetId: subnet.subnetId,
 *   privateIpAddress: "10.0.1.50",
 *   securityGroupIds: [securityGroup.groupId],
 * });
 * ```
 *
 * Pinning `privateIpAddress` gives the interface a predictable address —
 * useful for appliances and services other resources reference by IP.
 *
 * ### Forwarding Appliances
 * **Example:** ENI with Source/Dest Check Disabled
 * ```typescript
 * const eni = yield* AWS.EC2.NetworkInterface("NatEni", {
 *   subnetId: subnet.subnetId,
 *   sourceDestCheck: false,
 *   securityGroupIds: [securityGroup.groupId],
 * });
 * ```
 *
 * Disable `sourceDestCheck` when the interface belongs to a NAT instance,
 * firewall, or router that forwards packets not addressed to itself.
 *
 * @resource
 */
export declare const NetworkInterface: import("../../Resource.ts").ResourceClass<NetworkInterface>;
export declare const NetworkInterfaceProvider: () => import("effect/Layer").Layer<Provider.Provider<NetworkInterface>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=NetworkInterface.d.ts.map