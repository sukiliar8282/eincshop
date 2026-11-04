import * as ddos from "@distilled.cloud/cloudflare/ddos-protection";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.DdosProtection.AllowlistEntry";
type TypeId = typeof TypeId;
export interface DdosAllowlistEntryProps {
    /**
     * The allowlisted prefix in CIDR format (e.g. `192.0.2.0/24`).
     *
     * Immutable — the API only patches comment/enabled, so changing the
     * prefix triggers a replacement.
     */
    prefix: string;
    /**
     * A comment describing the allowlist prefix. Mutable — patched in place.
     * Because allowlist entries carry no ownership markers, the default
     * comment brands the entry with a name derived from the app, stage, and
     * logical ID.
     * @default ${app}-${stage}-${id}
     */
    comment?: string;
    /**
     * Whether the allowlist prefix is in effect. Mutable — patched in place.
     * @default false
     */
    enabled?: boolean;
}
export interface DdosAllowlistEntryAttributes {
    /** Cloudflare-assigned identifier of the allowlist prefix. */
    allowlistId: string;
    /** The Cloudflare account the allowlist entry belongs to. */
    accountId: string;
    /** The allowlisted prefix in CIDR format. */
    prefix: string;
    /** The comment describing the allowlist prefix. */
    comment: string;
    /** Whether the allowlist prefix is in effect. */
    enabled: boolean;
    /** ISO8601 creation timestamp. */
    createdOn: string;
    /** ISO8601 last-modified timestamp. */
    modifiedOn: string;
}
export type DdosAllowlistEntry = Resource<TypeId, DdosAllowlistEntryProps, DdosAllowlistEntryAttributes, never, Providers>;
/**
 * An Advanced TCP Protection allowlist entry (Magic Transit).
 *
 * Traffic from an allowlisted prefix bypasses Advanced TCP Protection
 * entirely. An entry's identity is its `prefix` — only `comment` and
 * `enabled` are mutable in place; changing the prefix triggers a
 * replacement.
 *
 * Requires the **Magic Transit / Advanced TCP Protection** entitlement; on
 * accounts without it every API call fails with the typed
 * `AdvancedTcpProtectionNotEntitled` error.
 *
 * Safety: allowlist entries carry no ownership markers. When there is no
 * prior state, `read` scans for an existing entry with the same prefix and
 * reports it as `Unowned`, so the engine refuses to take it over unless
 * `--adopt` (or `adopt(true)`) is set.
 * ### Creating an allowlist entry
 * **Example:** Allowlist a trusted prefix
 * ```typescript
 * const entry = yield* Cloudflare.DdosProtection.DdosAllowlistEntry("OfficeEgress", {
 *   prefix: "192.0.2.0/24",
 *   enabled: true,
 * });
 * ```
 *
 * **Example:** Staged entry with an explicit comment
 * ```typescript
 * // `enabled: false` keeps the entry inert until you flip it on.
 * yield* Cloudflare.DdosProtection.DdosAllowlistEntry("PartnerRange", {
 *   prefix: "198.51.100.0/24",
 *   comment: "partner NAT range — enable during migration",
 *   enabled: false,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/ddos-protection/advanced-ddos-systems/overview/advanced-tcp-protection/
 *
 * @resource
 * @product DDoS Protection
 * @category Network
 */
export declare const DdosAllowlistEntry: import("../../Resource.ts").ResourceClass<DdosAllowlistEntry>;
/**
 * Returns true if the given value is a DdosAllowlistEntry resource.
 */
export declare const isDdosAllowlistEntry: (value: unknown) => value is DdosAllowlistEntry;
export declare const DdosAllowlistEntryProvider: () => import("effect/Layer").Layer<Provider.Provider<DdosAllowlistEntry>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | ddos.CloudflareOpContext>;
export {};
//# sourceMappingURL=AllowlistEntry.d.ts.map