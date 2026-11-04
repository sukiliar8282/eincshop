import * as firewall from "@distilled.cloud/cloudflare/firewall";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const LockdownTypeId: "Cloudflare.Firewall.Lockdown";
type LockdownTypeId = typeof LockdownTypeId;
/**
 * A single allow-list entry of a Zone Lockdown rule: a single IP address
 * (`ip`) or a CIDR range (`ip_range`) that is allowed to access the
 * locked-down URLs.
 */
export interface LockdownConfiguration {
    /**
     * Whether `value` is a single IP address (`ip`) or a CIDR range
     * (`ip_range`).
     */
    target: "ip" | "ip_range";
    /**
     * The IP address (e.g. `198.51.100.4`) or CIDR range
     * (e.g. `203.0.113.0/24`) to allow.
     */
    value: string;
}
export interface LockdownProps {
    /**
     * Zone the lockdown rule applies to.
     *
     * Stable — moving a rule between zones triggers a replacement.
     */
    zoneId: string;
    /**
     * The URLs to lock down. Each entry is escaped before use, so only simple
     * wildcard patterns are supported (e.g. `shop.example.com/admin*`).
     *
     * Mutable — updated in place via PUT.
     */
    urls: string[];
    /**
     * The IP addresses and CIDR ranges that are allowed to access the URLs.
     * Everyone else is blocked.
     *
     * Mutable — updated in place via PUT.
     */
    configurations: LockdownConfiguration[];
    /**
     * An informative summary of the rule. Sanitized server-side (HTML tags
     * are removed).
     *
     * Mutable — updated in place via PUT.
     */
    description?: string;
    /**
     * When true, the rule is disabled without being deleted.
     *
     * Mutable — updated in place via PUT.
     *
     * @default false
     */
    paused?: boolean;
    /**
     * Processing order — a lower number indicates higher priority. Rules
     * without a priority are processed before rules with one.
     *
     * Mutable — updated in place via PUT.
     */
    priority?: number;
}
export interface LockdownAttributes {
    /** Cloudflare-assigned identifier of the Zone Lockdown rule. */
    lockdownId: string;
    /** Zone the rule belongs to. */
    zoneId: string;
    /** The locked-down URL patterns. */
    urls: string[];
    /** The allowed IP addresses and CIDR ranges. */
    configurations: LockdownConfiguration[];
    /** The rule's informative summary, if set. */
    description: string | undefined;
    /** Whether the rule is currently paused. */
    paused: boolean;
    /** The rule's processing priority, if set. */
    priority: number | undefined;
    /** ISO8601 creation timestamp. */
    createdOn: string;
    /** ISO8601 last-modified timestamp. */
    modifiedOn: string;
}
export type Lockdown = Resource<LockdownTypeId, LockdownProps, LockdownAttributes, never, Providers>;
/**
 * A Cloudflare Zone Lockdown rule — restrict one or more URL patterns on a
 * zone so that only an allow-list of IP addresses and CIDR ranges can access
 * them. Every other visitor receives an "Access Denied" page.
 *
 * Everything about a lockdown rule is mutable in place: `urls`,
 * `configurations`, `description`, `paused`, and `priority` are all updated
 * via PUT without replacing the rule. Only moving the rule to a different
 * zone triggers a replacement.
 *
 * Zone Lockdown is available on Pro plans and above, with per-plan rule
 * quotas (Pro: 3, Business: 10, Enterprise: 200). Cloudflare rejects a
 * second rule covering the same URLs with a duplicate error, so a rule's
 * URL set acts as its identity within a zone.
 *
 * Safety: lockdown rules carry no ownership markers. When there is no prior
 * state, `read` scans the zone for an existing rule with the same URL set
 * and reports it as `Unowned`, so the engine refuses to take it over unless
 * `--adopt` (or `adopt(true)`) is set.
 * ### Locking down a URL
 * **Example:** Allow a single office IP to reach an admin panel
 * ```typescript
 * yield* Cloudflare.Firewall.Lockdown("AdminLockdown", {
 *   zoneId: zone.zoneId,
 *   urls: ["shop.example.com/admin*"],
 *   configurations: [{ target: "ip", value: "198.51.100.4" }],
 *   description: "only the office can reach /admin",
 * });
 * ```
 *
 * **Example:** Allow a CIDR range across multiple URLs
 * ```typescript
 * yield* Cloudflare.Firewall.Lockdown("StaffOnly", {
 *   zoneId: zone.zoneId,
 *   urls: ["example.com/internal*", "example.com/staging*"],
 *   configurations: [
 *     { target: "ip_range", value: "203.0.113.0/24" },
 *     { target: "ip", value: "198.51.100.4" },
 *   ],
 * });
 * ```
 *
 * ### Pausing a rule
 * **Example:** Temporarily disable a lockdown without deleting it
 * ```typescript
 * yield* Cloudflare.Firewall.Lockdown("AdminLockdown", {
 *   zoneId: zone.zoneId,
 *   urls: ["shop.example.com/admin*"],
 *   configurations: [{ target: "ip", value: "198.51.100.4" }],
 *   paused: true,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/waf/tools/zone-lockdown/
 *
 * @resource
 * @product Firewall
 * @category Application Security
 */
export declare const Lockdown: import("../../Resource.ts").ResourceClass<Lockdown>;
/**
 * Returns true if the given value is a Lockdown resource.
 */
export declare const isLockdown: (value: unknown) => value is Lockdown;
export declare const LockdownProvider: () => import("effect/Layer").Layer<Provider.Provider<Lockdown>, never, CloudflareEnvironment | firewall.CloudflareOpContext>;
export {};
//# sourceMappingURL=Lockdown.d.ts.map