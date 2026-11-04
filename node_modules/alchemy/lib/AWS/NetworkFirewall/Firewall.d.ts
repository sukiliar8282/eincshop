import type * as NFW from "@distilled.cloud/aws/network-firewall";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface FirewallProps {
    /**
     * Name of the firewall. Must be 1-128 alphanumeric characters or hyphens.
     * If omitted, a deterministic physical name is generated. Changing the
     * name replaces the firewall.
     */
    firewallName?: string;
    /**
     * ARN of the {@link FirewallPolicy} that defines the firewall's traffic
     * inspection behavior. Updated in place via `AssociateFirewallPolicy`.
     */
    firewallPolicyArn: string;
    /**
     * ID of the VPC the firewall protects. Changing the VPC replaces the
     * firewall.
     */
    vpcId: string;
    /**
     * The public subnets (one per Availability Zone) that Network Firewall
     * provisions firewall endpoints into. Uses raw Network Firewall API
     * structures (`{ SubnetId, IPAddressType? }`). Updated in place via
     * `AssociateSubnets` / `DisassociateSubnets`.
     */
    subnetMappings: NFW.SubnetMapping[];
    /**
     * Whether the firewall is protected against deletion. The provider
     * automatically clears this flag before deleting the firewall.
     * @default false
     */
    deleteProtection?: boolean;
    /**
     * Whether the firewall is protected against changes to its subnet
     * associations.
     * @default false
     */
    subnetChangeProtection?: boolean;
    /**
     * Whether the firewall is protected against a change of firewall policy.
     * @default false
     */
    firewallPolicyChangeProtection?: boolean;
    /**
     * Human-readable description of the firewall.
     */
    description?: string;
    /**
     * Tags to apply to the firewall. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Firewall extends Resource<"AWS.NetworkFirewall.Firewall", FirewallProps, {
    /** Name of the firewall. */
    firewallName: string;
    /** ARN of the firewall. */
    firewallArn: string;
    /** Server-assigned unique id of the firewall. */
    firewallId: string;
    /** ID of the VPC the firewall is provisioned into. */
    vpcId: string;
    /**
     * The VPC endpoint IDs of the provisioned firewall endpoints, one per
     * subnet mapping, sorted for determinism. Use these as route targets.
     */
    endpointIds: string[];
}, never, Providers> {
}
/**
 * An AWS Network Firewall firewall — provisions managed firewall endpoints
 * into your VPC subnets and inspects traffic according to an associated
 * {@link FirewallPolicy}.
 *
 * Endpoint provisioning takes several minutes (typically 5-10), and deleting
 * a firewall waits for the endpoints to deprovision.
 * ### Creating Firewalls
 * **Example:** Firewall in a VPC
 * ```typescript
 * import * as EC2 from "alchemy/AWS/EC2";
 * import * as NetworkFirewall from "alchemy/AWS/NetworkFirewall";
 *
 * const vpc = yield* EC2.Vpc("Vpc", { cidrBlock: "10.0.0.0/16" });
 * const subnet = yield* EC2.Subnet("FirewallSubnet", {
 *   vpcId: vpc.vpcId,
 *   cidrBlock: "10.0.1.0/24",
 * });
 *
 * const policy = yield* NetworkFirewall.FirewallPolicy("Policy", {
 *   firewallPolicy: {
 *     StatelessDefaultActions: ["aws:pass"],
 *     StatelessFragmentDefaultActions: ["aws:pass"],
 *   },
 * });
 *
 * const firewall = yield* NetworkFirewall.Firewall("Firewall", {
 *   firewallPolicyArn: policy.firewallPolicyArn,
 *   vpcId: vpc.vpcId,
 *   subnetMappings: [{ SubnetId: subnet.subnetId }],
 * });
 * ```
 *
 * @resource
 */
export declare const Firewall: import("../../Resource.ts").ResourceClass<Firewall>;
declare const FirewallNotReady_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "FirewallNotReady";
} & Readonly<A>;
/** Raised (internally, for bounded retry) while a firewall is provisioning. */
export declare class FirewallNotReady extends FirewallNotReady_base<{
    message: string;
}> {
}
declare const FirewallNotDeleted_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "FirewallNotDeleted";
} & Readonly<A>;
/** Raised (internally, for bounded retry) while a firewall is deleting. */
export declare class FirewallNotDeleted extends FirewallNotDeleted_base<{
    message: string;
}> {
}
export declare const FirewallProvider: () => import("effect/Layer").Layer<Provider.Provider<Firewall>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Firewall.d.ts.map