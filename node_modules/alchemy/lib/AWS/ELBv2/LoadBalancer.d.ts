import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { AccountID } from "../Environment.ts";
import type { SecurityGroupId } from "../EC2/SecurityGroup.ts";
import type { SubnetId } from "../EC2/Subnet.ts";
import type { RegionID } from "../Region.ts";
export type LoadBalancerName = string;
export type LoadBalancerArn = `arn:aws:elasticloadbalancing:${RegionID}:${AccountID}:loadbalancer/${string}`;
export interface LoadBalancerProps {
    /** The load balancer name. If omitted, a unique name is generated. Changing it replaces the load balancer. */
    name?: string;
    /**
     * Whether the load balancer is internet-facing or internal. Changing it
     * replaces the load balancer.
     * @default "internet-facing"
     */
    scheme?: "internal" | "internet-facing";
    /**
     * The load balancer type. Changing it replaces the load balancer.
     * @default "application"
     */
    type?: "application" | "network" | "gateway";
    /**
     * The subnets to attach. Mutually exclusive with {@link subnetMappings}.
     * Updated in place via `setSubnets`.
     */
    subnets?: Input<SubnetId[]>;
    /**
     * Per-subnet mappings for static/EIP addresses (Network Load Balancers).
     * Mutually exclusive with {@link subnets}. Updated in place via `setSubnets`.
     */
    subnetMappings?: {
        subnetId: Input<SubnetId>;
        /** The allocation ID of an Elastic IP (NLB). */
        allocationId?: string;
        /** A private IPv4 address from the subnet (internal NLB). */
        privateIPv4Address?: string;
        /** An IPv6 address from the subnet (dualstack NLB). */
        iPv6Address?: string;
        /** A source NAT IPv6 prefix. */
        sourceNatIpv6Prefix?: string;
    }[];
    /** The security groups to attach. Updated in place via `setSecurityGroups`. */
    securityGroups?: Input<SecurityGroupId[]>;
    /** The IP address type (`ipv4`, `dualstack`, ...). Updated in place via `setIpAddressType`. */
    ipAddressType?: string;
    /** The ID of the customer-owned IPv4 pool (Outposts). Changing it replaces the load balancer. */
    customerOwnedIpv4Pool?: string;
    /** Whether to prefix-delegate IPv6 for source NAT (`on`/`off`). */
    enablePrefixForIpv6SourceNat?: "on" | "off";
    /**
     * Whether to enforce security-group inbound rules on PrivateLink traffic
     * (`on`/`off`). Carried by `setSecurityGroups`.
     */
    enforceSecurityGroupInboundRulesOnPrivateLinkTraffic?: "on" | "off";
    /** Raw load-balancer attributes (idle timeout, deletion protection, access logs, ...). */
    attributes?: Record<string, string>;
    /** Tags to apply to the load balancer. */
    tags?: Record<string, string>;
}
export interface LoadBalancer extends Resource<"AWS.ELBv2.LoadBalancer", LoadBalancerProps, {
    /** The ARN of the load balancer. */
    loadBalancerArn: LoadBalancerArn;
    /** The name of the load balancer. */
    loadBalancerName: LoadBalancerName;
    /** The public DNS name of the load balancer. */
    dnsName: string;
    /** The Route 53 hosted zone ID for alias records targeting the load balancer. */
    canonicalHostedZoneId: string;
    /** The ID of the VPC the load balancer resides in. */
    vpcId: string;
    /** Whether the load balancer is `internet-facing` or `internal`. */
    scheme: string;
    /** The load balancer type (`application`, `network`, or `gateway`). */
    type: string;
    /** The IDs of the security groups attached to the load balancer. */
    securityGroups: string[];
    /** The IDs of the subnets the load balancer spans. */
    subnets: string[];
    /** The tags applied to the load balancer. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An ELBv2 (Application / Network / Gateway) load balancer.
 * ### Creating a Load Balancer
 * **Example:** Internet-facing Application Load Balancer
 * ```typescript
 * const lb = yield* LoadBalancer("web", {
 *   type: "application",
 *   scheme: "internet-facing",
 *   subnets: [subnet1.subnetId, subnet2.subnetId],
 *   securityGroups: [sg.groupId],
 * });
 * ```
 *
 * **Example:** Network Load Balancer with static EIPs
 * ```typescript
 * const nlb = yield* LoadBalancer("edge", {
 *   type: "network",
 *   scheme: "internet-facing",
 *   subnetMappings: [
 *     { subnetId: subnet1.subnetId, allocationId: eip1.allocationId },
 *     { subnetId: subnet2.subnetId, allocationId: eip2.allocationId },
 *   ],
 * });
 * ```
 *
 * ### Attributes
 * **Example:** Idle timeout and deletion protection
 * ```typescript
 * const lb = yield* LoadBalancer("web", {
 *   type: "application",
 *   subnets: [subnet1.subnetId, subnet2.subnetId],
 *   attributes: {
 *     "idle_timeout.timeout_seconds": "120",
 *     "deletion_protection.enabled": "true",
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const LoadBalancer: import("../../Resource.ts").ResourceClass<LoadBalancer>;
export declare const LoadBalancerProvider: () => import("effect/Layer").Layer<Provider.Provider<LoadBalancer>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=LoadBalancer.d.ts.map