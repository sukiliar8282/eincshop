import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { AccountID } from "../Environment.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
import type { VpcId } from "./Vpc.ts";
export type DhcpOptionsId<ID extends string = string> = `dopt-${ID}`;
export type DhcpOptionsArn<ID extends DhcpOptionsId = DhcpOptionsId> = `arn:aws:ec2:${RegionID}:${AccountID}:dhcp-options/${ID}`;
export interface DhcpOptionsProps {
    /**
     * The domain name for hosts in the VPC (e.g. `example.internal`). Immutable —
     * a DHCP options set cannot be edited, so any change replaces it.
     */
    domainName?: string;
    /**
     * The IP addresses (up to four) of the domain name servers, or
     * `AmazonProvidedDNS`. Immutable.
     */
    domainNameServers?: string[];
    /**
     * The IP addresses (up to four) of the NTP servers. Immutable.
     */
    ntpServers?: string[];
    /**
     * The IP addresses (up to four) of the NetBIOS name servers. Immutable.
     */
    netbiosNameServers?: string[];
    /**
     * The NetBIOS node type (1, 2, 4, or 8). AWS recommends 2. Immutable.
     */
    netbiosNodeType?: "1" | "2" | "4" | "8";
    /**
     * The ID of a VPC to associate this DHCP options set with. When set, the VPC
     * is associated on create/update; on delete (or when this is cleared) the VPC
     * is re-associated with the account's default options set. Mutable.
     */
    vpcId?: VpcId;
    /**
     * Tags to assign to the DHCP options set.
     */
    tags?: Record<string, string>;
}
export interface DhcpOptions extends Resource<"AWS.EC2.DhcpOptions", DhcpOptionsProps, {
    /**
     * The ID of the DHCP options set (prefixed `dopt-`).
     */
    dhcpOptionsId: DhcpOptionsId;
    /**
     * The Amazon Resource Name (ARN) of the DHCP options set.
     */
    dhcpOptionsArn: DhcpOptionsArn;
    /**
     * The AWS account ID of the DHCP options set owner.
     */
    ownerId: string;
    /**
     * The ID of the VPC this options set is associated with, if any.
     */
    vpcId?: VpcId;
}, never, Providers> {
}
/**
 * A DHCP options set configures the DHCP parameters (domain name, DNS servers,
 * NTP servers, NetBIOS settings) that a VPC hands out to the instances launched
 * inside it. Attach a custom set to a VPC to override the AWS defaults — for
 * example to point instances at your own DNS or an internal search domain.
 *
 * A DHCP options set is immutable: AWS provides no edit API, so changing any
 * DHCP parameter replaces the set. Setting `vpcId` associates the set with a
 * VPC; clearing it (or deleting the resource) re-associates the VPC with the
 * account's default options set, since a set must be disassociated from every
 * VPC before it can be deleted.
 *
 * ### Creating a DHCP Options Set
 * **Example:** Custom DNS and Search Domain
 * ```typescript
 * const dhcp = yield* AWS.EC2.DhcpOptions("CorpDhcp", {
 *   domainName: "corp.internal",
 *   domainNameServers: ["10.0.0.2", "AmazonProvidedDNS"],
 *   vpcId: myVpc.vpcId,
 * });
 * ```
 * Creates the options set and associates it with the VPC in one step.
 * Instances launched into the VPC receive the `corp.internal` search domain and
 * the listed DNS servers.
 *
 * **Example:** NTP and NetBIOS Configuration
 * ```typescript
 * const dhcp = yield* AWS.EC2.DhcpOptions("Dhcp", {
 *   ntpServers: ["169.254.169.123"],
 *   netbiosNameServers: ["10.0.0.5"],
 *   netbiosNodeType: "2",
 * });
 * ```
 * Creates an unassociated options set that you can associate later by setting
 * `vpcId`.
 *
 * @resource
 */
export declare const DhcpOptions: import("../../Resource.ts").ResourceClass<DhcpOptions>;
export declare const DhcpOptionsProvider: () => import("effect/Layer").Layer<Provider.Provider<DhcpOptions>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DhcpOptions.d.ts.map