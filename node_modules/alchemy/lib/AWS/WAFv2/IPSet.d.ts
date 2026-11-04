import type * as WAFV2 from "@distilled.cloud/aws/wafv2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import { type WafScope } from "./internal.ts";
export interface IPSetProps {
    /**
     * Name of the IP set. Must match `^[\w\-]+$` and be 1-128 characters.
     * Changing the name replaces the IP set.
     * @default a physical name derived from the app, stage and logical ID
     */
    ipSetName?: string;
    /**
     * Scope of the IP set — `REGIONAL` (ambient region) or `CLOUDFRONT`
     * (pinned to `us-east-1`). Must match the scope of the web ACLs and rule
     * groups that reference it. Changing the scope replaces the IP set.
     * @default "REGIONAL"
     */
    scope?: WafScope;
    /**
     * IP address version of the entries. Changing the version replaces the
     * IP set.
     * @default "IPV4"
     */
    ipAddressVersion?: WAFV2.IPAddressVersion;
    /**
     * IP addresses and ranges in CIDR notation (e.g. `192.0.2.44/32`,
     * `2620:0:2d0:200::/64`). Mutable — updated in place.
     */
    addresses: string[];
    /**
     * Description of the IP set.
     */
    description?: string;
    /**
     * User-defined tags to apply to the IP set.
     */
    tags?: Record<string, string>;
}
export interface IPSet extends Resource<"AWS.WAFv2.IPSet", IPSetProps, {
    /**
     * Name of the IP set.
     */
    ipSetName: string;
    /**
     * WAF-assigned unique ID of the IP set.
     */
    ipSetId: string;
    /**
     * ARN of the IP set — reference it from a rule's
     * `IPSetReferenceStatement`.
     */
    ipSetArn: string;
    /**
     * Scope the IP set was created in.
     */
    scope: WafScope;
    /**
     * IP address version of the entries.
     */
    ipAddressVersion: WAFV2.IPAddressVersion;
    /**
     * Current addresses in the set.
     */
    addresses: string[];
}, never, Providers> {
}
/**
 * An AWS WAFv2 IP set — a named collection of IP addresses and CIDR ranges
 * referenced from web ACL and rule group rules via
 * `IPSetReferenceStatement`.
 *
 * ### Creating IP Sets
 * **Example:** Block List of IPv4 Addresses
 * ```typescript
 * const blockList = yield* AWS.WAFv2.IPSet("BlockList", {
 *   addresses: ["192.0.2.44/32", "203.0.113.0/24"],
 * });
 * ```
 *
 * **Example:** Reference from a Web ACL Rule
 * ```typescript
 * const acl = yield* AWS.WAFv2.WebACL("Firewall", {
 *   rules: [
 *     {
 *       Name: "block-bad-ips",
 *       Priority: 0,
 *       Statement: {
 *         IPSetReferenceStatement: { ARN: blockList.ipSetArn },
 *       },
 *       Action: { Block: {} },
 *       VisibilityConfig: {
 *         SampledRequestsEnabled: true,
 *         CloudWatchMetricsEnabled: true,
 *         MetricName: "block-bad-ips",
 *       },
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const IPSet: import("../../Resource.ts").ResourceClass<IPSet>;
export declare const IPSetProvider: () => import("effect/Layer").Layer<Provider.Provider<IPSet>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=IPSet.d.ts.map