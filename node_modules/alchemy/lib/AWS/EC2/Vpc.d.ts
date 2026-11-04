import * as EC2 from "@distilled.cloud/aws/ec2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { AccountID } from "../Environment.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type VpcId = `vpc-${string}`;
export declare const VpcId: <const S extends string>(value: S) => S & VpcId;
export type VpcArn = `arn:aws:ec2:${RegionID}:${AccountID}:vpc/${VpcId}`;
export interface VpcProps {
    /**
     * The IPv4 network range for the VPC, in CIDR notation.
     * Required unless using IPAM.
     * @example "10.0.0.0/16"
     */
    cidrBlock?: string;
    /**
     * The ID of an IPv4 IPAM pool you want to use for allocating this VPC's CIDR.
     */
    ipv4IpamPoolId?: string;
    /**
     * The netmask length of the IPv4 CIDR you want to allocate to this VPC from an IPAM pool.
     */
    ipv4NetmaskLength?: number;
    /**
     * The ID of an IPv6 IPAM pool which will be used to allocate this VPC an IPv6 CIDR.
     */
    ipv6IpamPoolId?: string;
    /**
     * The netmask length of the IPv6 CIDR you want to allocate to this VPC from an IPAM pool.
     */
    ipv6NetmaskLength?: number;
    /**
     * Requests an Amazon-provided IPv6 CIDR block with a /56 prefix length for the VPC.
     */
    ipv6CidrBlock?: string;
    /**
     * The ID of an IPv6 address pool from which to allocate the IPv6 CIDR block.
     */
    ipv6Pool?: string;
    /**
     * The Availability Zone or Local Zone Group name for the IPv6 CIDR block.
     */
    ipv6CidrBlockNetworkBorderGroup?: string;
    /**
     * The tenancy options for instances launched into the VPC.
     * @default "default"
     */
    instanceTenancy?: EC2.Tenancy;
    /**
     * Whether DNS resolution is supported for the VPC.
     * @default true
     */
    enableDnsSupport?: boolean;
    /**
     * Whether instances launched in the VPC get DNS hostnames.
     * @default true
     */
    enableDnsHostnames?: boolean;
    /**
     * Requests an Amazon-provided IPv6 CIDR block with a /56 prefix length for the VPC.
     */
    amazonProvidedIpv6CidrBlock?: boolean;
    /**
     * Tags to assign to the VPC.
     * These will be merged with alchemy auto-tags (alchemy::stack, alchemy::stage, alchemy::id).
     */
    tags?: Record<string, string>;
}
export interface Vpc extends Resource<"AWS.EC2.VPC", VpcProps, {
    /**
     * The ID of the VPC.
     */
    vpcId: VpcId;
    /**
     * The Amazon Resource Name (ARN) of the VPC.
     */
    vpcArn: VpcArn;
    /**
     * The primary IPv4 CIDR block for the VPC.
     */
    cidrBlock: string;
    /**
     * The ID of the set of DHCP options associated with the VPC.
     */
    dhcpOptionsId: string;
    /**
     * The current state of the VPC.
     */
    state: EC2.VpcState;
    /**
     * Whether the VPC is the default VPC.
     */
    isDefault: boolean;
    /**
     * The ID of the AWS account that owns the VPC.
     */
    ownerId?: string;
    /**
     * Information about the IPv4 CIDR blocks associated with the VPC.
     */
    cidrBlockAssociationSet?: Array<{
        associationId: string;
        cidrBlock: string;
        cidrBlockState: {
            state: EC2.VpcCidrBlockStateCode;
            statusMessage?: string;
        };
    }>;
    /**
     * Information about the IPv6 CIDR blocks associated with the VPC.
     */
    ipv6CidrBlockAssociationSet?: Array<{
        associationId: string;
        ipv6CidrBlock: string;
        ipv6CidrBlockState: {
            state: EC2.VpcCidrBlockStateCode;
            statusMessage?: string;
        };
        networkBorderGroup?: string;
        ipv6Pool?: string;
    }>;
    /**
     * The tags currently assigned to the VPC, including alchemy auto-tags.
     */
    tags?: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon VPC (Virtual Private Cloud) — an isolated virtual network that is
 * the root of any custom AWS networking topology. Subnets, route tables,
 * gateways, security groups, and instances are all created inside a VPC.
 *
 * Changing the `cidrBlock`, `instanceTenancy`, or an IPAM/IPv6 pool replaces
 * the VPC.
 *
 * ### Creating a VPC
 * A VPC is defined by a private IPv4 address range (`cidrBlock`). Pick a block
 * from the RFC 1918 private space (e.g. `10.0.0.0/16`) that is large enough to
 * subdivide into subnets across your Availability Zones.
 *
 * **Example:** Basic VPC
 * ```typescript
 * const vpc = yield* AWS.EC2.Vpc("MyVpc", {
 *   cidrBlock: "10.0.0.0/16",
 * });
 * ```
 *
 * A `/16` gives you 65,536 addresses to carve into subnets — enough headroom
 * for a multi-AZ, multi-tier network. This is the minimal config every other
 * networking resource builds on.
 *
 * **Example:** Allocating IPv4 from an IPAM pool
 * ```typescript
 * const vpc = yield* AWS.EC2.Vpc("MyVpc", {
 *   ipv4IpamPoolId: "ipam-pool-0123456789abcdef0",
 *   ipv4NetmaskLength: 16,
 * });
 * ```
 *
 * Instead of hard-coding `cidrBlock`, let AWS IPAM hand out a non-overlapping
 * range of the requested size. Use this when an organization centrally manages
 * address space to avoid CIDR collisions between accounts.
 *
 * ### DNS Resolution
 * Two independent toggles control DNS behavior inside the VPC. `enableDnsSupport`
 * lets instances resolve names via the Amazon DNS server; `enableDnsHostnames`
 * additionally assigns public DNS hostnames to instances with public IPs.
 *
 * **Example:** Enable DNS support and hostnames
 * ```typescript
 * const vpc = yield* AWS.EC2.Vpc("MyVpc", {
 *   cidrBlock: "10.0.0.0/16",
 *   enableDnsSupport: true,
 *   enableDnsHostnames: true,
 * });
 * ```
 *
 * Enable both when instances need public DNS names or when you rely on private
 * hosted zones and VPC endpoints, which require DNS resolution to function.
 *
 * ### Instance Tenancy
 * **Example:** Dedicated tenancy
 * ```typescript
 * const vpc = yield* AWS.EC2.Vpc("MyVpc", {
 *   cidrBlock: "10.0.0.0/16",
 *   instanceTenancy: "dedicated",
 * });
 * ```
 *
 * Forcing `"dedicated"` tenancy ensures every instance launched in the VPC runs
 * on single-tenant hardware — required by some compliance regimes, but more
 * expensive than the `"default"` shared tenancy. This property cannot be
 * changed after creation without replacing the VPC.
 *
 * ### IPv6 Addressing
 * A VPC can carry an IPv6 `/56` block alongside its IPv4 range. The block can
 * come from Amazon's pool, an IPAM pool, or your own BYOIP pool
 * (`ipv6CidrBlock` + `ipv6Pool`, optionally scoped to a
 * `ipv6CidrBlockNetworkBorderGroup`).
 *
 * **Example:** Amazon-provided IPv6 block
 * ```typescript
 * const vpc = yield* AWS.EC2.Vpc("MyVpc", {
 *   cidrBlock: "10.0.0.0/16",
 *   amazonProvidedIpv6CidrBlock: true,
 * });
 * ```
 *
 * Requests an Amazon-assigned IPv6 `/56`, the simplest way to make a VPC
 * dual-stack. Pair it with IPv6-enabled subnets and an egress-only internet
 * gateway for outbound-only IPv6 connectivity.
 *
 * **Example:** IPv6 from an IPAM pool
 * ```typescript
 * const vpc = yield* AWS.EC2.Vpc("MyVpc", {
 *   cidrBlock: "10.0.0.0/16",
 *   ipv6IpamPoolId: "ipam-pool-0fedcba9876543210",
 *   ipv6NetmaskLength: 56,
 * });
 * ```
 *
 * Draws the IPv6 block from a centrally-managed IPAM pool instead of Amazon's
 * pool, giving you deterministic, organization-governed IPv6 ranges.
 *
 * ### Composing a Network
 * **Example:** VPC with a subnet
 * ```typescript
 * const vpc = yield* AWS.EC2.Vpc("MyVpc", {
 *   cidrBlock: "10.0.0.0/16",
 *   enableDnsSupport: true,
 *   enableDnsHostnames: true,
 * });
 *
 * const subnet = yield* AWS.EC2.Subnet("PublicSubnet", {
 *   vpcId: vpc.vpcId,
 *   cidrBlock: "10.0.1.0/24",
 *   availabilityZone: "us-east-1a",
 *   mapPublicIpOnLaunch: true,
 * });
 * ```
 *
 * Passing `vpc.vpcId` into a `Subnet` is how you build out a topology — the
 * subnet's CIDR must fall within the VPC's `cidrBlock`. Add route tables,
 * gateways, and security groups the same way.
 *
 * ### Tagging
 * **Example:** Tagging a VPC
 * ```typescript
 * const vpc = yield* AWS.EC2.Vpc("MyVpc", {
 *   cidrBlock: "10.0.0.0/16",
 *   tags: {
 *     Name: "production-vpc",
 *     Environment: "production",
 *   },
 * });
 * ```
 *
 * User tags are merged with alchemy's auto-tags (`alchemy::stack`,
 * `alchemy::stage`, `alchemy::id`), which brand the VPC as managed by your
 * stack. The `Name` tag is what surfaces in the EC2 console.
 *
 * @resource
 */
export declare const Vpc: import("../../Resource.ts").ResourceClass<Vpc>;
export declare const VpcProvider: () => import("effect/Layer").Layer<Provider.Provider<Vpc>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Vpc.d.ts.map