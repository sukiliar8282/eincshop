import type * as EC2 from "@distilled.cloud/aws/ec2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { NetworkAclId } from "./NetworkAcl.ts";
export interface NetworkAclEntryProps {
    /**
     * The ID of the network ACL.
     */
    networkAclId: NetworkAclId;
    /**
     * The rule number for the entry (1-32766).
     * Rules are evaluated in order from lowest to highest.
     */
    ruleNumber: number;
    /**
     * The protocol number.
     * A value of "-1" means all protocols.
     * Common values: 6 (TCP), 17 (UDP), 1 (ICMP)
     */
    protocol: string;
    /**
     * Whether to allow or deny the traffic that matches the rule.
     */
    ruleAction: EC2.RuleAction;
    /**
     * Whether this is an egress (outbound) rule.
     * @default false
     */
    egress?: boolean;
    /**
     * The IPv4 CIDR block.
     * Either cidrBlock or ipv6CidrBlock must be specified.
     */
    cidrBlock?: string;
    /**
     * The IPv6 CIDR block.
     * Either cidrBlock or ipv6CidrBlock must be specified.
     */
    ipv6CidrBlock?: string;
    /**
     * ICMP type and code. Required if protocol is 1 (ICMP) or 58 (ICMPv6).
     */
    icmpTypeCode?: {
        /** The ICMP code. Use -1 to specify all codes. */
        code?: number;
        /** The ICMP type. Use -1 to specify all types. */
        type?: number;
    };
    /**
     * The port range for TCP/UDP protocols.
     */
    portRange?: {
        /** The first port in the range. */
        from?: number;
        /** The last port in the range. */
        to?: number;
    };
}
export interface NetworkAclEntry extends Resource<"AWS.EC2.NetworkAclEntry", NetworkAclEntryProps, {
    /** The ID of the network ACL. */
    networkAclId: NetworkAclId;
    /** The rule number. */
    ruleNumber: number;
    /** Whether this is an egress rule. */
    egress: boolean;
    /** The protocol. */
    protocol: string;
    /** The rule action (allow or deny). */
    ruleAction: EC2.RuleAction;
    /** The IPv4 CIDR block. */
    cidrBlock?: string;
    /** The IPv6 CIDR block. */
    ipv6CidrBlock?: string;
    /** The ICMP type and code. */
    icmpTypeCode?: {
        code?: number;
        type?: number;
    };
    /** The port range. */
    portRange?: {
        from?: number;
        to?: number;
    };
}, never, Providers> {
}
/**
 * A single rule in a `NetworkAcl` — a numbered, stateless allow/deny entry that
 * matches traffic by protocol, CIDR (IPv4 or IPv6), and, for TCP/UDP, a port
 * range.
 *
 * Each entry is identified by its `(networkAclId, ruleNumber, egress)` triple,
 * and changing any of those three replaces the entry. Rules are evaluated from
 * the lowest `ruleNumber` upward and the first match wins, so leave gaps between
 * numbers to make room for future rules. Because NACLs are stateless, always add
 * a matching ephemeral-port rule for return traffic.
 *
 * ### Inbound Rules
 * Inbound rules (`egress: false`) match traffic entering the subnet. A common
 * pattern is to allow trusted source ranges plus the ephemeral ports needed for
 * return traffic.
 * **Example:** Allow Inbound Traffic from the VPC CIDR
 * ```typescript
 * const allowVpc = yield* AWS.EC2.NetworkAclEntry("AllowVpc", {
 *   networkAclId: acl.networkAclId,
 *   ruleNumber: 100,
 *   protocol: "-1",
 *   ruleAction: "allow",
 *   egress: false,
 *   cidrBlock: "10.0.0.0/16",
 * });
 * ```
 * `protocol: "-1"` matches all protocols and `cidrBlock` scopes the rule to the
 * VPC's IPv4 range; the low `ruleNumber` (100) makes it take precedence over
 * higher-numbered rules.
 *
 * **Example:** Allow Inbound Ephemeral Ports (NAT Return Traffic)
 * ```typescript
 * const allowEphemeral = yield* AWS.EC2.NetworkAclEntry("AllowEphemeral", {
 *   networkAclId: acl.networkAclId,
 *   ruleNumber: 200,
 *   protocol: "6",
 *   ruleAction: "allow",
 *   egress: false,
 *   cidrBlock: "0.0.0.0/0",
 *   portRange: { from: 1024, to: 65535 },
 * });
 * ```
 * Because the ACL is stateless, responses to outbound requests arrive on
 * ephemeral ports and need their own inbound rule; `protocol: "6"` is TCP and
 * `portRange` restricts the match to the ephemeral port range.
 *
 * **Example:** Deny a Specific IPv6 Range
 * ```typescript
 * const denyRange = yield* AWS.EC2.NetworkAclEntry("DenyBadActor", {
 *   networkAclId: acl.networkAclId,
 *   ruleNumber: 50,
 *   protocol: "-1",
 *   ruleAction: "deny",
 *   egress: false,
 *   ipv6CidrBlock: "2001:db8:1234::/48",
 * });
 * ```
 * `ruleAction: "deny"` with a very low `ruleNumber` blocks an IPv6 range before
 * any allow rule can match it; use `ipv6CidrBlock` instead of `cidrBlock` to
 * target IPv6 traffic.
 *
 * ### Outbound Rules
 * Outbound rules (`egress: true`) match traffic leaving the subnet and are
 * numbered in their own sequence, independent of the inbound rules.
 * **Example:** Allow All Outbound Traffic
 * ```typescript
 * const allowEgress = yield* AWS.EC2.NetworkAclEntry("AllowEgress", {
 *   networkAclId: acl.networkAclId,
 *   ruleNumber: 100,
 *   protocol: "-1",
 *   ruleAction: "allow",
 *   egress: true,
 *   cidrBlock: "0.0.0.0/0",
 * });
 * ```
 * Setting `egress: true` makes this an outbound rule; allowing all protocols to
 * `0.0.0.0/0` is typical when you want the subnet to initiate connections freely.
 *
 * ### ICMP Rules
 * **Example:** Allow Inbound ICMP Echo (Ping)
 * ```typescript
 * const allowPing = yield* AWS.EC2.NetworkAclEntry("AllowPing", {
 *   networkAclId: acl.networkAclId,
 *   ruleNumber: 300,
 *   protocol: "1",
 *   ruleAction: "allow",
 *   egress: false,
 *   cidrBlock: "10.0.0.0/16",
 *   icmpTypeCode: { type: 8, code: -1 },
 * });
 * ```
 * ICMP (`protocol: "1"`) has no ports, so `icmpTypeCode` selects the message
 * type instead — type 8 is echo request and `code: -1` matches all codes.
 *
 * @resource
 */
export declare const NetworkAclEntry: import("../../Resource.ts").ResourceClass<NetworkAclEntry>;
export declare const NetworkAclEntryProvider: () => import("effect/Layer").Layer<Provider.Provider<NetworkAclEntry>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=NetworkAclEntry.d.ts.map