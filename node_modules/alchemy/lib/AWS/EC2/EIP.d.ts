import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { AccountID } from "../Environment.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type EIPArn = `arn:aws:ec2:${RegionID}:${AccountID}:elastic-ip/${AllocationId}`;
export type AllocationId<ID extends string = string> = `eipalloc-${ID}`;
export declare const AllocationId: <ID extends string>(id: ID) => ID & AllocationId<ID>;
export interface EIPProps {
    /**
     * Indicates whether the Elastic IP address is for use with instances in a VPC or EC2-Classic.
     * @default "vpc"
     */
    domain?: "vpc" | "standard";
    /**
     * The ID of an address pool that you own.
     * Use this parameter to let Amazon EC2 select an address from the address pool.
     */
    publicIpv4Pool?: string;
    /**
     * A unique set of Availability Zones, Local Zones, or Wavelength Zones
     * from which AWS advertises IP addresses.
     */
    networkBorderGroup?: string;
    /**
     * The ID of a customer-owned address pool.
     * Use this parameter to let Amazon EC2 select an address from the address pool.
     */
    customerOwnedIpv4Pool?: string;
    /**
     * Tags to assign to the Elastic IP.
     * These will be merged with alchemy auto-tags.
     */
    tags?: Record<string, string>;
}
export interface EIP extends Resource<"AWS.EC2.EIP", EIPProps, {
    /**
     * The allocation ID for the Elastic IP address.
     */
    allocationId: AllocationId;
    /**
     * The Amazon Resource Name (ARN) of the Elastic IP.
     */
    eipArn: `arn:aws:ec2:${RegionID}:${AccountID}:elastic-ip/${string}`;
    /**
     * The Elastic IP address.
     */
    publicIp: string;
    /**
     * The ID of an address pool.
     */
    publicIpv4Pool?: string;
    /**
     * Indicates whether the Elastic IP address is for use with instances in a VPC or EC2-Classic.
     */
    domain: "vpc" | "standard";
    /**
     * The network border group.
     */
    networkBorderGroup?: string;
    /**
     * The customer-owned IP address.
     */
    customerOwnedIp?: string;
    /**
     * The ID of the customer-owned address pool.
     */
    customerOwnedIpv4Pool?: string;
    /**
     * The carrier IP address associated with the network interface.
     */
    carrierIp?: string;
}, never, Providers> {
}
/**
 * An Elastic IP address — a static, public IPv4 address allocated to your AWS
 * account that you can attach to instances, network interfaces, or NAT
 * gateways.
 *
 * Allocating an `EIP` reserves the address; you then reference its
 * `allocationId` from the resource that should use it (for example a public
 * `NatGateway`). The address is released back to AWS when the resource is
 * destroyed. The pool-related properties (`publicIpv4Pool`,
 * `networkBorderGroup`, `customerOwnedIpv4Pool`) are immutable and replace the
 * address when changed.
 *
 * ### Allocating Elastic IPs
 * By default an Elastic IP is allocated for use within a VPC (`domain: "vpc"`),
 * which is the only domain available to modern accounts.
 * **Example:** VPC-Scoped Elastic IP
 * ```typescript
 * const eip = yield* AWS.EC2.EIP("MyEip", {
 *   domain: "vpc",
 *   tags: { Name: "app-eip" },
 * });
 * ```
 * This reserves a standard, Amazon-owned public IPv4 address scoped to your VPC;
 * `domain` defaults to `"vpc"`, so it can be omitted, and `tags` help you find
 * the address in the console and on the bill.
 *
 * ### Bring-Your-Own-IP and Address Pools
 * If you have onboarded an address range to AWS (BYOIP) or use Outposts, you can
 * draw the address from a specific pool instead of Amazon's general pool.
 * **Example:** Allocate from a Public IPv4 (BYOIP) Pool
 * ```typescript
 * const eip = yield* AWS.EC2.EIP("ByoipEip", {
 *   publicIpv4Pool: "ipv4pool-ec2-0abcdef1234567890",
 *   networkBorderGroup: "us-east-1",
 * });
 * ```
 * `publicIpv4Pool` selects an address from a pool you own rather than a random
 * Amazon address, and `networkBorderGroup` restricts which zone group AWS
 * advertises it from (useful for Local and Wavelength Zones).
 *
 * **Example:** Allocate from a Customer-Owned Pool (Outposts)
 * ```typescript
 * const eip = yield* AWS.EC2.EIP("CoIpEip", {
 *   customerOwnedIpv4Pool: "ipv4pool-coip-0abcdef1234567890",
 * });
 * ```
 * `customerOwnedIpv4Pool` pulls a customer-owned IP (CoIP) from an
 * Outposts-associated pool, for workloads that must use your own on-premises
 * address space.
 *
 * ### Using an Elastic IP
 * **Example:** Attach to a NAT Gateway
 * ```typescript
 * const eip = yield* AWS.EC2.EIP("NatEip", {});
 *
 * const natGateway = yield* AWS.EC2.NatGateway("NatGateway", {
 *   subnetId: publicSubnet.subnetId,
 *   allocationId: eip.allocationId,
 * });
 * ```
 * Downstream resources consume the reserved address through its `allocationId`;
 * here the EIP becomes the fixed public IP of a NAT gateway.
 *
 * @resource
 */
export declare const EIP: import("../../Resource.ts").ResourceClass<EIP>;
export declare const EIPProvider: () => import("effect/Layer").Layer<Provider.Provider<EIP>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=EIP.d.ts.map