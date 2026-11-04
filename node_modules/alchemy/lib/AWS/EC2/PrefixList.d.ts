import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { AccountID } from "../Environment.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type PrefixListId<ID extends string = string> = `pl-${ID}`;
export declare const PrefixListId: <ID extends string>(id: ID) => ID & PrefixListId<ID>;
export type PrefixListArn<ID extends PrefixListId = PrefixListId> = `arn:aws:ec2:${RegionID}:${AccountID}:prefix-list/${ID}`;
/**
 * A single CIDR entry in a managed prefix list.
 */
export interface PrefixListEntry {
    /**
     * The CIDR block for this entry. Must match the list's `addressFamily`
     * (an IPv4 CIDR for `IPv4`, an IPv6 CIDR for `IPv6`).
     */
    cidr: string;
    /**
     * An optional description for the entry (up to 255 characters).
     */
    description?: string;
}
export interface PrefixListProps {
    /**
     * A name for the prefix list. If omitted, a unique name is generated from
     * the app, stage, and logical ID. Up to 255 characters. Mutable.
     */
    prefixListName?: string;
    /**
     * The IP address family of the prefix list. Determines the CIDR format
     * accepted in `entries`. Immutable — changing it replaces the list.
     * @default "IPv4"
     */
    addressFamily?: "IPv4" | "IPv6";
    /**
     * The maximum number of entries the prefix list can hold. Required by AWS.
     * Can be increased in place (not decreased) — a decrease replaces the list.
     */
    maxEntries: number;
    /**
     * The CIDR entries in the prefix list. Added/removed in place via versioned
     * modifications.
     * @default []
     */
    entries?: PrefixListEntry[];
    /**
     * Tags to assign to the prefix list.
     */
    tags?: Record<string, string>;
}
export interface PrefixList extends Resource<"AWS.EC2.PrefixList", PrefixListProps, {
    /**
     * The ID of the prefix list (prefixed `pl-`).
     */
    prefixListId: PrefixListId;
    /**
     * The Amazon Resource Name (ARN) of the prefix list.
     */
    prefixListArn: PrefixListArn;
    /**
     * The name of the prefix list.
     */
    prefixListName: string;
    /**
     * The IP address family of the prefix list.
     */
    addressFamily: "IPv4" | "IPv6";
    /**
     * The maximum number of entries the prefix list can hold.
     */
    maxEntries: number;
    /**
     * The current version of the prefix list. Incremented on every entry
     * modification.
     */
    version: number;
    /**
     * The AWS account ID of the prefix list owner.
     */
    ownerId: string;
}, never, Providers> {
}
/**
 * A managed prefix list is a named, reusable set of CIDR blocks that you
 * reference by ID from security group rules and route tables. Instead of
 * duplicating the same IP ranges across many rules, you maintain them in one
 * place and every rule that references the list picks up changes automatically.
 *
 * The list is versioned: each entry modification bumps `version`, and AWS
 * limits a list to `maxEntries` CIDRs (you provision headroom up front and can
 * only grow it, never shrink it, in place). `addressFamily` fixes whether the
 * list holds IPv4 or IPv6 CIDRs and is immutable.
 *
 * ### Creating a Prefix List
 * **Example:** Basic IPv4 Prefix List
 * ```typescript
 * const corpNetworks = yield* AWS.EC2.PrefixList("CorpNetworks", {
 *   maxEntries: 10,
 *   entries: [
 *     { cidr: "10.0.0.0/16", description: "vpc-a" },
 *     { cidr: "10.1.0.0/16", description: "vpc-b" },
 *   ],
 * });
 * ```
 * Creates a prefix list with two IPv4 CIDRs. The resulting `prefixListId`
 * (prefixed `pl-`) can be referenced from security group rules and routes.
 *
 * **Example:** IPv6 Prefix List
 * ```typescript
 * const ipv6List = yield* AWS.EC2.PrefixList("Ipv6List", {
 *   addressFamily: "IPv6",
 *   maxEntries: 5,
 *   entries: [{ cidr: "2001:db8::/32" }],
 * });
 * ```
 * `addressFamily: "IPv6"` makes the list accept IPv6 CIDRs. Because the family
 * is intrinsic to the list, changing it later replaces the resource.
 *
 * ### Referencing a Prefix List from a Security Group Rule
 * **Example:** Allow Inbound from a Prefix List
 * ```typescript
 * const corpNetworks = yield* AWS.EC2.PrefixList("CorpNetworks", {
 *   maxEntries: 10,
 *   entries: [{ cidr: "10.0.0.0/16" }],
 * });
 *
 * const rule = yield* AWS.EC2.SecurityGroupRule("AllowCorp", {
 *   groupId: sg.groupId,
 *   type: "ingress",
 *   ipProtocol: "tcp",
 *   fromPort: 443,
 *   toPort: 443,
 *   prefixListId: corpNetworks.prefixListId,
 * });
 * ```
 * The rule allows HTTPS from every CIDR in the list. Editing the list's
 * `entries` updates what the rule permits without touching the rule itself.
 *
 * @resource
 */
export declare const PrefixList: import("../../Resource.ts").ResourceClass<PrefixList>;
export declare const PrefixListProvider: () => import("effect/Layer").Layer<Provider.Provider<PrefixList>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=PrefixList.d.ts.map