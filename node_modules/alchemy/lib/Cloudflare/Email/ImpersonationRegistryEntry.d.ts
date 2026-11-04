import * as emailSecurity from "@distilled.cloud/cloudflare/email-security";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const EmailSecurityImpersonationRegistryEntryTypeId: "Cloudflare.Email.ImpersonationRegistryEntry";
type EmailSecurityImpersonationRegistryEntryTypeId = typeof EmailSecurityImpersonationRegistryEntryTypeId;
export interface ImpersonationRegistryEntryProps {
    /**
     * The display name to protect (e.g. a VIP's name as it appears in the
     * `From` header). Together with `email` it forms the entry's identity
     * for cold-state recovery.
     */
    name: string;
    /**
     * The legitimate email address (or regular expression) for the display
     * name. Messages using the display name from a different address are
     * flagged as impersonation/BEC.
     */
    email: string;
    /**
     * Whether `email` is a regular expression.
     * @default false
     */
    isEmailRegex?: boolean;
    /**
     * Free-form notes about the entry.
     */
    comments?: string;
}
export interface ImpersonationRegistryEntryAttributes {
    /** Cloudflare-assigned impersonation registry entry identifier. */
    entryId: string;
    /** The account the entry belongs to. */
    accountId: string;
    /** The protected display name. */
    name: string;
    /** The legitimate email address (or regex). */
    email: string;
    /** Whether the email is a regular expression. */
    isEmailRegex: boolean;
    /** Free-form notes about the entry, if set. */
    comments: string | undefined;
    /**
     * Where the entry came from. Manually created entries are
     * `A1S_INTERNAL`; directory-synced entries carry the integration's
     * provenance.
     */
    provenance: string | undefined;
    /** ISO8601 creation timestamp. */
    createdAt: string;
    /** ISO8601 last-modified timestamp, if the entry has been modified. */
    modifiedAt: string | undefined;
}
export type ImpersonationRegistryEntry = Resource<EmailSecurityImpersonationRegistryEntryTypeId, ImpersonationRegistryEntryProps, ImpersonationRegistryEntryAttributes, never, Providers>;
/**
 * A Cloudflare Email Security (Area 1) impersonation registry entry —
 * maps a protected display name (e.g. a VIP) to their legitimate email
 * address for BEC/impersonation detection.
 *
 * All fields are mutable in place. Directory-synced fields
 * (`directory_id`, `directory_node_id`, `provenance`) are managed by
 * Office365/Google integrations and are not exposed as inputs. Requires
 * the Email Security enterprise add-on; accounts without the entitlement
 * receive the typed `EmailSecurityNotEntitled` error.
 * ### Registering Protected Identities
 * **Example:** Protect an executive's display name
 * ```typescript
 * yield* Cloudflare.Email.ImpersonationRegistryEntry("Ceo", {
 *   name: "Jane Smith",
 *   email: "jane.smith@example.com",
 *   comments: "CEO — high-value BEC target",
 * });
 * ```
 *
 * **Example:** Match several legitimate addresses with a regex
 * ```typescript
 * yield* Cloudflare.Email.ImpersonationRegistryEntry("Finance", {
 *   name: "Accounts Payable",
 *   email: "^ap(-[a-z]+)?@example\\.com$",
 *   isEmailRegex: true,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/email-security/
 *
 * @resource
 * @product Email Security
 * @category Email
 */
export declare const ImpersonationRegistryEntry: import("../../Resource.ts").ResourceClass<ImpersonationRegistryEntry>;
/**
 * Returns true if the given value is an
 * ImpersonationRegistryEntry resource.
 */
export declare const isImpersonationRegistryEntry: (value: unknown) => value is ImpersonationRegistryEntry;
export declare const ImpersonationRegistryEntryProvider: () => import("effect/Layer").Layer<Provider.Provider<ImpersonationRegistryEntry>, never, CloudflareEnvironment | emailSecurity.CloudflareOpContext>;
export {};
//# sourceMappingURL=ImpersonationRegistryEntry.d.ts.map