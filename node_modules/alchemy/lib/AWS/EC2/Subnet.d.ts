import * as ec2 from "@distilled.cloud/aws/ec2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { AccountID } from "../Environment.ts";
import type { RegionID } from "../Region.ts";
import type { VpcId } from "./Vpc.ts";
export type SubnetId<ID extends string = string> = `subnet-${ID}`;
export declare const SubnetId: <ID extends string>(id: ID) => ID & SubnetId<ID>;
export type SubnetArn = `arn:aws:ec2:${RegionID}:${AccountID}:subnet/${SubnetId}`;
export interface SubnetProps {
    /**
     * The VPC to create the subnet in.
     */
    vpcId: VpcId;
    /**
     * The IPv4 network range for the subnet, in CIDR notation.
     * Required unless using IPAM.
     * @example "10.0.1.0/24"
     */
    cidrBlock?: string;
    /**
     * The IPv6 network range for the subnet, in CIDR notation.
     */
    ipv6CidrBlock?: string;
    /**
     * The Availability Zone for the subnet.
     * @example "us-east-1a"
     */
    availabilityZone?: string;
    /**
     * The ID of the Availability Zone for the subnet.
     */
    availabilityZoneId?: string;
    /**
     * The ID of an IPv4 IPAM pool you want to use for allocating this subnet's CIDR.
     */
    ipv4IpamPoolId?: string;
    /**
     * The netmask length of the IPv4 CIDR you want to allocate to this subnet from an IPAM pool.
     */
    ipv4NetmaskLength?: number;
    /**
     * The ID of an IPv6 IPAM pool which will be used to allocate this subnet an IPv6 CIDR.
     */
    ipv6IpamPoolId?: string;
    /**
     * The netmask length of the IPv6 CIDR you want to allocate to this subnet from an IPAM pool.
     */
    ipv6NetmaskLength?: number;
    /**
     * Whether instances launched in the subnet get public IPv4 addresses.
     * @default false
     */
    mapPublicIpOnLaunch?: boolean;
    /**
     * Whether instances launched in the subnet get IPv6 addresses.
     * @default false
     */
    assignIpv6AddressOnCreation?: boolean;
    /**
     * Whether DNS queries made to the Amazon-provided DNS Resolver in this subnet should return
     * synthetic IPv6 addresses for IPv4-only destinations.
     * @default false
     */
    enableDns64?: boolean;
    /**
     * Whether to enable resource name DNS A record on launch.
     * @default false
     */
    enableResourceNameDnsARecordOnLaunch?: boolean;
    /**
     * Whether to enable resource name DNS AAAA record on launch.
     * @default false
     */
    enableResourceNameDnsAAAARecordOnLaunch?: boolean;
    /**
     * The hostname type for EC2 instances launched into this subnet.
     */
    hostnameType?: ec2.HostnameType;
    /**
     * Tags to assign to the subnet.
     * These will be merged with alchemy auto-tags (alchemy::stack, alchemy::stage, alchemy::id).
     */
    tags?: Record<string, string>;
}
export interface Subnet extends Resource<"AWS.EC2.Subnet", SubnetProps, {
    /**
     * The ID of the VPC the subnet is in.
     */
    vpcId: VpcId;
    /**
     * The ID of the subnet.
     */
    subnetId: SubnetId;
    /**
     * The Amazon Resource Name (ARN) of the subnet.
     */
    subnetArn: SubnetArn;
    /**
     * The IPv4 CIDR block for the subnet.
     */
    cidrBlock: string;
    /**
     * The Availability Zone of the subnet.
     */
    availabilityZone: string;
    /**
     * The ID of the Availability Zone of the subnet.
     */
    availabilityZoneId?: string;
    /**
     * The current state of the subnet.
     */
    state: ec2.SubnetState;
    /**
     * The number of available IPv4 addresses in the subnet.
     */
    availableIpAddressCount: number;
    /**
     * Whether instances launched in the subnet get public IPv4 addresses.
     */
    mapPublicIpOnLaunch: boolean;
    /**
     * Whether instances launched in the subnet get IPv6 addresses.
     */
    assignIpv6AddressOnCreation: boolean | undefined;
    /**
     * Whether the subnet is the default subnet for the Availability Zone.
     */
    defaultForAz: boolean;
    /**
     * The ID of the AWS account that owns the subnet.
     */
    ownerId?: string;
    /**
     * Information about the IPv6 CIDR blocks associated with the subnet.
     */
    ipv6CidrBlockAssociationSet?: Array<{
        associationId: string;
        ipv6CidrBlock: string;
        ipv6CidrBlockState: {
            state: ec2.SubnetCidrBlockStateCode;
            statusMessage?: string;
        };
    }>;
    /**
     * Whether DNS64 is enabled for the subnet.
     */
    enableDns64?: boolean;
    /**
     * Whether this is an IPv6-only subnet.
     */
    ipv6Native?: boolean;
    /**
     * The private DNS name options on launch.
     */
    privateDnsNameOptionsOnLaunch?: {
        hostnameType?: ec2.HostnameType;
        enableResourceNameDnsARecord?: boolean;
        enableResourceNameDnsAAAARecord?: boolean;
    };
}, never, Providers> {
}
/**
 * A subnet within a VPC — a range of IP addresses bound to a single
 * Availability Zone where you place instances and other resources. Create
 * public subnets (with `mapPublicIpOnLaunch`) for internet-facing resources
 * and private subnets for internal ones.
 *
 * Changing the `vpcId`, `cidrBlock`, availability zone, or an IPAM/IPv6 pool
 * replaces the subnet.
 *
 * ### Creating a Subnet
 * A subnet carves a smaller CIDR range out of its parent VPC's block. The
 * `cidrBlock` must be a subset of the VPC CIDR and must not overlap any sibling
 * subnet. You can also let AWS IPAM allocate the range via `ipv4IpamPoolId` +
 * `ipv4NetmaskLength`.
 *
 * **Example:** Basic Subnet
 * ```typescript
 * const subnet = yield* AWS.EC2.Subnet("TestSubnet", {
 *   vpcId: vpc.vpcId,
 *   cidrBlock: "10.0.1.0/24",
 * });
 * ```
 *
 * The minimal subnet: a `/24` (256 addresses) inside the VPC. Without an
 * explicit `availabilityZone`, AWS picks one for you.
 *
 * ### Availability Zone Placement
 * Each subnet lives in exactly one AZ. Pin it with `availabilityZone` (the zone
 * name, e.g. `us-east-1a`) or `availabilityZoneId` (the stable zone ID, e.g.
 * `use1-az1`) to spread tiers across zones for high availability.
 *
 * **Example:** Subnet pinned to an Availability Zone
 * ```typescript
 * const subnet = yield* AWS.EC2.Subnet("Az1Subnet", {
 *   vpcId: vpc.vpcId,
 *   cidrBlock: "10.0.1.0/24",
 *   availabilityZone: "us-east-1a",
 * });
 * ```
 *
 * Pinning the AZ lets you place a matching subnet in `us-east-1b` and run
 * resources redundantly across zones. Use `availabilityZoneId` instead when you
 * need the physical zone to line up across different AWS accounts.
 *
 * ### Public IP Assignment
 * **Example:** Public subnet
 * ```typescript
 * const publicSubnet = yield* AWS.EC2.Subnet("PublicSubnet", {
 *   vpcId: vpc.vpcId,
 *   cidrBlock: "10.0.1.0/24",
 *   availabilityZone: "us-east-1a",
 *   mapPublicIpOnLaunch: true,
 *   tags: { Name: "public-1a", Tier: "public" },
 * });
 * ```
 *
 * `mapPublicIpOnLaunch: true` makes this a "public" subnet — instances launched
 * here automatically get a public IPv4 address. Combine it with an internet
 * gateway route so those instances can reach the internet.
 *
 * ### IPv6 Subnets
 * For dual-stack VPCs, give the subnet an IPv6 `cidrBlock`, auto-assign IPv6
 * addresses on launch with `assignIpv6AddressOnCreation`, and optionally enable
 * `enableDns64` so the Amazon DNS resolver synthesizes IPv6 addresses for
 * IPv4-only destinations (NAT64).
 *
 * **Example:** IPv6-enabled subnet
 * ```typescript
 * const subnet = yield* AWS.EC2.Subnet("Ipv6Subnet", {
 *   vpcId: vpc.vpcId,
 *   cidrBlock: "10.0.1.0/24",
 *   ipv6CidrBlock: "2600:1f18:abcd:1234::/64",
 *   assignIpv6AddressOnCreation: true,
 *   enableDns64: true,
 * });
 * ```
 *
 * Instances launched here receive an IPv6 address automatically, and `enableDns64`
 * lets them reach IPv4-only services through a NAT gateway. The IPv6 `/64` must
 * come from the parent VPC's IPv6 block.
 *
 * ### DNS Hostname Options
 * Control what hostnames instances receive on launch. `hostnameType` chooses
 * between IP-based names (`ip-name`) and resource-based names (`resource-name`),
 * and the `enableResourceNameDnsARecordOnLaunch` /
 * `enableResourceNameDnsAAAARecordOnLaunch` flags register A / AAAA records for
 * resource-name hosts.
 *
 * **Example:** Resource-name DNS hostnames
 * ```typescript
 * const subnet = yield* AWS.EC2.Subnet("ResourceNameSubnet", {
 *   vpcId: vpc.vpcId,
 *   cidrBlock: "10.0.1.0/24",
 *   hostnameType: "resource-name",
 *   enableResourceNameDnsARecordOnLaunch: true,
 *   enableResourceNameDnsAAAARecordOnLaunch: true,
 * });
 * ```
 *
 * Resource-name hostnames are derived from the instance ID rather than its IP,
 * so they stay stable across stop/start. Enabling the A/AAAA records makes those
 * names resolvable over IPv4 and IPv6.
 *
 * ### Public & Private Tiers
 * **Example:** A public and a private subnet in one VPC
 * ```typescript
 * const vpc = yield* AWS.EC2.Vpc("MyVpc", {
 *   cidrBlock: "10.0.0.0/16",
 *   enableDnsSupport: true,
 *   enableDnsHostnames: true,
 * });
 *
 * const publicSubnet = yield* AWS.EC2.Subnet("PublicSubnet", {
 *   vpcId: vpc.vpcId,
 *   cidrBlock: "10.0.1.0/24",
 *   availabilityZone: "us-east-1a",
 *   mapPublicIpOnLaunch: true,
 * });
 *
 * const privateSubnet = yield* AWS.EC2.Subnet("PrivateSubnet", {
 *   vpcId: vpc.vpcId,
 *   cidrBlock: "10.0.10.0/24",
 *   availabilityZone: "us-east-1a",
 * });
 * ```
 *
 * The canonical two-tier pattern: a public subnet (auto public IPs, routed to an
 * internet gateway) for load balancers and a private subnet (no public IPs) for
 * application and database instances. Both share the same AZ here, but in
 * production you'd replicate the pair across AZs.
 *
 * @resource
 */
export declare const Subnet: import("../../Resource.ts").ResourceClass<Subnet>;
export declare const SubnetProvider: () => import("effect/Layer").Layer<Provider.Provider<Subnet>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Subnet.d.ts.map