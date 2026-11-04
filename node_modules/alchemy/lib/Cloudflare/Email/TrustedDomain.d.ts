import * as emailSecurity from "@distilled.cloud/cloudflare/email-security";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const EmailSecurityTrustedDomainTypeId: "Cloudflare.Email.TrustedDomain";
type EmailSecurityTrustedDomainTypeId = typeof EmailSecurityTrustedDomainTypeId;
export interface TrustedDomainProps {
    /**
     * The domain (or regular expression) to trust. The pattern is the
     * entry's identity for cold-state recovery — a pre-existing entry with
     * the same pattern is reported as unowned and only taken over when
     * adoption is enabled.
     */
    pattern: string;
    /**
     * Prevents recently registered domains from triggering a Suspicious or
     * Malicious disposition.
     * @default false
     */
    isRecent?: boolean;
    /**
     * For partner or other approved domains with similar spelling to your
     * connected domains — prevents the listed domains from triggering a
     * Spoof disposition.
     * @default false
     */
    isSimilarity?: boolean;
    /**
     * Whether `pattern` is a regular expression.
     * @default false
     */
    isRegex?: boolean;
    /**
     * Free-form notes about the trusted domain.
     */
    comments?: string;
}
export interface TrustedDomainAttributes {
    /** Cloudflare-assigned trusted domain identifier. */
    trustedDomainId: string;
    /** The account the entry belongs to. */
    accountId: string;
    /** The trusted domain pattern. */
    pattern: string;
    /** Whether recently registered domain protection is disabled. */
    isRecent: boolean;
    /** Whether lookalike/partner domain Spoof protection is disabled. */
    isSimilarity: boolean;
    /** Whether the pattern is a regular expression. */
    isRegex: boolean;
    /** Free-form notes about the entry, if set. */
    comments: string | undefined;
    /** ISO8601 creation timestamp. */
    createdAt: string;
    /** ISO8601 last-modified timestamp, if the entry has been modified. */
    modifiedAt: string | undefined;
}
export type TrustedDomain = Resource<EmailSecurityTrustedDomainTypeId, TrustedDomainProps, TrustedDomainAttributes, never, Providers>;
/**
 * A Cloudflare Email Security (Area 1) trusted domain — exempts a domain
 * from recently-registered and lookalike (similarity) detections.
 *
 * All fields are mutable in place. Requires the Email Security enterprise
 * add-on; accounts without the entitlement receive the typed
 * `EmailSecurityNotEntitled` error.
 * ### Trusting Domains
 * **Example:** Trust a partner domain with similar spelling
 * ```typescript
 * yield* Cloudflare.Email.TrustedDomain("PartnerLookalike", {
 *   pattern: "examp1e-partner.com",
 *   isSimilarity: true,
 *   comments: "legitimate partner domain",
 * });
 * ```
 *
 * **Example:** Trust a recently registered domain
 * ```typescript
 * yield* Cloudflare.Email.TrustedDomain("NewSubsidiary", {
 *   pattern: "brand-new-subsidiary.example",
 *   isRecent: true,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/email-security/
 *
 * @resource
 * @product Email Security
 * @category Email
 */
export declare const TrustedDomain: import("../../Resource.ts").ResourceClass<TrustedDomain>;
/**
 * Returns true if the given value is an TrustedDomain resource.
 */
export declare const isTrustedDomain: (value: unknown) => value is TrustedDomain;
export declare const TrustedDomainProvider: () => import("effect/Layer").Layer<Provider.Provider<TrustedDomain>, never, CloudflareEnvironment | emailSecurity.CloudflareOpContext>;
export {};
//# sourceMappingURL=TrustedDomain.d.ts.map