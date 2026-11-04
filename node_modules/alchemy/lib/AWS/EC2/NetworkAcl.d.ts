import * as ec2 from "@distilled.cloud/aws/ec2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { AccountID } from "../Environment.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
import type { VpcId } from "./Vpc.ts";
export type NetworkAclId<ID extends string = string> = `acl-${ID}`;
export declare const NetworkAclId: <ID extends string>(id: ID) => ID & NetworkAclId<ID>;
export type NetworkAclArn<ID extends NetworkAclId = NetworkAclId> = `arn:aws:ec2:${RegionID}:${AccountID}:network-acl/${ID}`;
export interface NetworkAclProps {
    /**
     * The VPC to create the network ACL in.
     */
    vpcId: VpcId;
    /**
     * Tags to assign to the network ACL.
     */
    tags?: Record<string, string>;
}
export interface NetworkAcl extends Resource<"AWS.EC2.NetworkAcl", NetworkAclProps, {
    /**
     * The ID of the network ACL.
     */
    networkAclId: NetworkAclId;
    /**
     * The Amazon Resource Name (ARN) of the network ACL.
     */
    networkAclArn: NetworkAclArn;
    /**
     * The ID of the VPC the network ACL belongs to.
     */
    vpcId: VpcId;
    /**
     * Whether this is the default network ACL for the VPC.
     */
    isDefault: boolean;
    /**
     * The ID of the AWS account that owns the network ACL.
     */
    ownerId: string;
    /**
     * The rule entries (inbound and outbound) currently defined on the ACL.
     */
    entries?: Array<{
        /** The rule number; rules are evaluated lowest to highest. */
        ruleNumber: number;
        /** The protocol number ("-1" means all protocols). */
        protocol: string;
        /** Whether the rule allows or denies matching traffic. */
        ruleAction: ec2.RuleAction;
        /** Whether this is an egress (outbound) rule. */
        egress: boolean;
        /** The IPv4 CIDR block the rule applies to. */
        cidrBlock?: string;
        /** The IPv6 CIDR block the rule applies to. */
        ipv6CidrBlock?: string;
        /** The ICMP type and code, for ICMP rules. */
        icmpTypeCode?: {
            code?: number;
            type?: number;
        };
        /** The port range, for TCP/UDP rules. */
        portRange?: {
            from?: number;
            to?: number;
        };
    }>;
    /**
     * The subnet associations currently attached to the network ACL.
     */
    associations?: Array<{
        /** The ID of the association between the ACL and the subnet. */
        networkAclAssociationId: string;
        /** The ID of the associated network ACL. */
        networkAclId: string;
        /** The ID of the associated subnet. */
        subnetId: string;
    }>;
}, never, Providers> {
}
/**
 * A network ACL — a stateless firewall that controls inbound and outbound
 * traffic at the *subnet* level, evaluated as an ordered list of numbered
 * allow/deny rules.
 *
 * Unlike security groups (which are stateful and attach to interfaces), a
 * network ACL is associated with subnets and evaluates return traffic
 * independently, so you typically pair each inbound rule with a matching
 * ephemeral-port outbound rule. The ACL itself only takes `vpcId` and `tags`;
 * the actual rules live in `NetworkAclEntry` resources and subnet attachments
 * in `NetworkAclAssociation` resources. Changing `vpcId` replaces the ACL.
 *
 * ### Creating Network ACLs
 * **Example:** Basic Network ACL
 * ```typescript
 * const acl = yield* AWS.EC2.NetworkAcl("PrivateNetworkAcl", {
 *   vpcId: vpc.vpcId,
 *   tags: { Name: "private-nacl" },
 * });
 * ```
 * This creates an empty custom ACL in the VPC — it starts with only the implicit
 * default-deny rules, so until you add entries it blocks all traffic on any
 * subnet you associate with it.
 *
 * ### Composing Rules and Associations
 * A network ACL is only useful once you attach rules and point subnets at it.
 * The typical pattern is one `NetworkAcl`, several `NetworkAclEntry` rules, and
 * one `NetworkAclAssociation` per subnet.
 * **Example:** Network ACL with an Inbound Rule and Subnet Association
 * ```typescript
 * const acl = yield* AWS.EC2.NetworkAcl("PrivateNetworkAcl", {
 *   vpcId: vpc.vpcId,
 * });
 *
 * const allowVpc = yield* AWS.EC2.NetworkAclEntry("AllowVpc", {
 *   networkAclId: acl.networkAclId,
 *   ruleNumber: 100,
 *   protocol: "-1",
 *   ruleAction: "allow",
 *   egress: false,
 *   cidrBlock: "10.0.0.0/16",
 * });
 *
 * const association = yield* AWS.EC2.NetworkAclAssociation("SubnetAssoc", {
 *   networkAclId: acl.networkAclId,
 *   subnetId: privateSubnet.subnetId,
 * });
 * ```
 * The entry allows all traffic from within the VPC CIDR and the association
 * makes the subnet use this ACL instead of the VPC default. Build up the full
 * rule set by adding more `NetworkAclEntry` resources with increasing
 * `ruleNumber`s.
 *
 * @resource
 */
export declare const NetworkAcl: import("../../Resource.ts").ResourceClass<NetworkAcl>;
export declare const NetworkAclProvider: () => import("effect/Layer").Layer<Provider.Provider<NetworkAcl>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=NetworkAcl.d.ts.map