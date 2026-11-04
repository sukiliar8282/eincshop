import * as mnm from "@distilled.cloud/cloudflare/magic-network-monitoring";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.MagicNetworkMonitoring.Rule";
type TypeId = typeof TypeId;
/**
 * MNM rule type: `threshold` (static bits/packets-per-second limits),
 * `zscore` (anomaly detection), or `advanced_ddos` (requires Magic Transit).
 */
export type RuleType = "threshold" | "zscore" | "advanced_ddos";
/**
 * How long a threshold must be exceeded before an alert fires.
 */
export type RuleDuration = "1m" | "5m" | "10m" | "15m" | "20m" | "30m" | "45m" | "60m";
export interface RuleProps {
    /**
     * The Cloudflare account the rule belongs to. Defaults to the profile's
     * account. Pass the owning MNM Config's `accountId` output to sequence
     * the rule after the configuration (rules cannot be created until the
     * account's MNM configuration exists).
     */
    accountId?: string;
    /**
     * The name of the rule. Must be unique within the account. Supports
     * `A-Z`, `a-z`, `0-9`, underscore, dash, period, and tilde — no spaces.
     * Max 256 characters. If omitted, a unique name is generated from the
     * app, stage, and logical ID. Mutable in place.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * MNM rule type. Immutable — the rule's alerting semantics differ
     * entirely per type, so changing it triggers a replacement.
     */
    type: RuleType;
    /**
     * IPv4 CIDR prefixes the rule monitors. Mutable in place.
     */
    prefixes: string[];
    /**
     * Toggle on to have Cloudflare automatically advertise the rule's
     * prefixes via Magic Transit when the rule triggers. Requires Magic
     * Transit.
     * @default false
     */
    automaticAdvertisement?: boolean;
    /**
     * Bits per second threshold (threshold rules). When exceeded for the
     * set duration, an alert notification is sent. Minimum of 1.
     */
    bandwidthThreshold?: number;
    /**
     * Packets per second threshold (threshold rules). When exceeded for the
     * set duration, an alert notification is sent. Minimum of 1.
     */
    packetThreshold?: number;
    /**
     * How long the threshold must be exceeded before an alert fires.
     * @default "1m"
     */
    duration?: RuleDuration;
    /**
     * Sensitivity of the anomaly detection (zscore rules).
     */
    zscoreSensitivity?: "low" | "medium" | "high";
    /**
     * Target of the zscore rule analysis (zscore rules).
     */
    zscoreTarget?: "bits" | "packets";
    /**
     * Prefix match type applied for prefix auto-advertisement
     * (advanced_ddos rules).
     */
    prefixMatch?: "exact" | "subnet" | "supernet";
}
export interface RuleAttributes {
    /** Cloudflare-assigned identifier of the rule. */
    ruleId: string;
    /** The Cloudflare account the rule belongs to. */
    accountId: string;
    /** The rule's unique name. */
    name: string;
    /** MNM rule type. */
    type: RuleType;
    /** IPv4 CIDR prefixes the rule monitors. */
    prefixes: string[];
    /** Whether prefixes are auto-advertised via Magic Transit on trigger. */
    automaticAdvertisement: boolean;
    /** Bits per second threshold, if set. */
    bandwidthThreshold: number | undefined;
    /** Packets per second threshold, if set. */
    packetThreshold: number | undefined;
    /**
     * Alert duration as reported by Cloudflare (normalized, e.g. `1m0s`).
     */
    duration: string | undefined;
    /** Zscore sensitivity, if set. */
    zscoreSensitivity: "low" | "medium" | "high" | (string & {}) | undefined;
    /** Zscore target, if set. */
    zscoreTarget: "bits" | "packets" | (string & {}) | undefined;
    /** Prefix match type, if set. */
    prefixMatch: "exact" | "subnet" | "supernet" | (string & {}) | undefined;
}
export type Rule = Resource<TypeId, RuleProps, RuleAttributes, never, Providers>;
/**
 * A Magic Network Monitoring (MNM) rule — alerts when traffic to a set of
 * IPv4 prefixes exceeds a static threshold (`threshold`), deviates from the
 * learned baseline (`zscore`), or matches advanced DDoS criteria
 * (`advanced_ddos`, Magic Transit only).
 *
 * Rules require the account's MNM configuration to exist first — pass the
 * Config resource's `accountId` output as this rule's `accountId` to
 * sequence the deployment. Rule names are unique per account; the rule
 * `type` is immutable and changing it triggers a replacement.
 * ### Threshold rules
 * **Example:** Alert when bandwidth exceeds 1 Mbps for 5 minutes
 * ```typescript
 * const config = yield* Cloudflare.MagicNetworkMonitoring.Config("Mnm", {
 *   name: "my-network",
 *   defaultSampling: 1,
 * });
 * yield* Cloudflare.MagicNetworkMonitoring.Rule("BandwidthAlert", {
 *   accountId: config.accountId,
 *   type: "threshold",
 *   prefixes: ["10.0.0.0/24"],
 *   bandwidthThreshold: 1_000_000,
 *   duration: "5m",
 * });
 * ```
 *
 * **Example:** Packet-rate alert
 * ```typescript
 * yield* Cloudflare.MagicNetworkMonitoring.Rule("PacketAlert", {
 *   accountId: config.accountId,
 *   type: "threshold",
 *   prefixes: ["10.0.1.0/24"],
 *   packetThreshold: 10_000,
 * });
 * ```
 *
 * ### Anomaly detection
 * **Example:** Zscore rule on bits
 * ```typescript
 * yield* Cloudflare.MagicNetworkMonitoring.Rule("AnomalyAlert", {
 *   accountId: config.accountId,
 *   type: "zscore",
 *   prefixes: ["10.0.2.0/24"],
 *   zscoreSensitivity: "medium",
 *   zscoreTarget: "bits",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/magic-network-monitoring/rules/
 *
 * @resource
 * @product Magic Network Monitoring
 * @category Network
 */
export declare const Rule: import("../../Resource.ts").ResourceClass<Rule>;
/**
 * Returns true if the given value is a Rule resource.
 */
export declare const isRule: (value: unknown) => value is Rule;
export declare const RuleProvider: () => import("effect/Layer").Layer<Provider.Provider<Rule>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | mnm.CloudflareOpContext>;
export {};
//# sourceMappingURL=Rule.d.ts.map