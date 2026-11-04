import * as emailSecurity from "@distilled.cloud/cloudflare/email-security";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const EmailSecurityAllowPolicyTypeId: "Cloudflare.Email.AllowPolicy";
type EmailSecurityAllowPolicyTypeId = typeof EmailSecurityAllowPolicyTypeId;
/**
 * Type of pattern matching for Email Security sender/recipient patterns.
 * `UNKNOWN` is deprecated and rejected on create/update, so it is not
 * accepted as an input.
 */
export type PatternType = "EMAIL" | "DOMAIN" | "IP";
export interface AllowPolicyProps {
    /**
     * The email address, domain, IP, or regular expression to match.
     * The pattern is the policy's identity for cold-state recovery — a
     * pre-existing policy with the same pattern is reported as unowned and
     * only taken over when adoption is enabled.
     */
    pattern: string;
    /**
     * Type of pattern matching.
     */
    patternType: PatternType;
    /**
     * Whether `pattern` is a regular expression.
     * @default false
     */
    isRegex?: boolean;
    /**
     * Messages from this sender are exempted from Spam, Spoof, and Bulk
     * dispositions. Does not exempt Malicious or Suspicious dispositions.
     * @default false
     */
    isAcceptableSender?: boolean;
    /**
     * Messages to this recipient bypass all detections.
     * @default false
     */
    isExemptRecipient?: boolean;
    /**
     * Messages from this sender bypass all detections and link following.
     * @default false
     */
    isTrustedSender?: boolean;
    /**
     * Enforce DMARC, SPF, or DKIM authentication — when on, Email Security
     * only honors the policy when the message passes authentication.
     * @default true
     */
    verifySender?: boolean;
    /**
     * Free-form notes about the policy.
     */
    comments?: string;
}
export interface AllowPolicyAttributes {
    /** Cloudflare-assigned allow policy identifier. */
    policyId: string;
    /** The account the policy belongs to. */
    accountId: string;
    /** The matched pattern. */
    pattern: string;
    /** Type of pattern matching. */
    patternType: PatternType;
    /** Whether the pattern is a regular expression. */
    isRegex: boolean;
    /** Whether the sender is exempted from Spam/Spoof/Bulk dispositions. */
    isAcceptableSender: boolean;
    /** Whether messages to the recipient bypass all detections. */
    isExemptRecipient: boolean;
    /** Whether the sender bypasses all detections and link following. */
    isTrustedSender: boolean;
    /** Whether sender authentication (SPF/DKIM/DMARC) is enforced. */
    verifySender: boolean;
    /** Free-form notes about the policy, if set. */
    comments: string | undefined;
    /** ISO8601 creation timestamp. */
    createdAt: string;
    /** ISO8601 last-modified timestamp, if the policy has been modified. */
    modifiedAt: string | undefined;
}
export type AllowPolicy = Resource<EmailSecurityAllowPolicyTypeId, AllowPolicyProps, AllowPolicyAttributes, never, Providers>;
/**
 * A Cloudflare Email Security (Area 1) allow policy — exempts messages
 * matching a sender/recipient pattern from detections.
 *
 * All fields are mutable in place. Requires the Email Security enterprise
 * add-on; accounts without the entitlement receive the typed
 * `EmailSecurityNotEntitled` error.
 * ### Creating an Allow Policy
 * **Example:** Acceptable sender by email address
 * ```typescript
 * yield* Cloudflare.Email.AllowPolicy("NewsletterSender", {
 *   pattern: "news@partner.example.com",
 *   patternType: "EMAIL",
 *   isAcceptableSender: true,
 * });
 * ```
 *
 * **Example:** Trusted sender domain (bypasses all detections)
 * ```typescript
 * yield* Cloudflare.Email.AllowPolicy("TrustedPartner", {
 *   pattern: "partner.example.com",
 *   patternType: "DOMAIN",
 *   isTrustedSender: true,
 *   comments: "contractually trusted partner",
 * });
 * ```
 *
 * **Example:** Exempt recipient
 * ```typescript
 * // Messages delivered to the abuse mailbox must never be filtered.
 * yield* Cloudflare.Email.AllowPolicy("AbuseMailbox", {
 *   pattern: "abuse@example.com",
 *   patternType: "EMAIL",
 *   isExemptRecipient: true,
 *   verifySender: false,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/email-security/
 *
 * @resource
 * @product Email Security
 * @category Email
 */
export declare const AllowPolicy: import("../../Resource.ts").ResourceClass<AllowPolicy>;
/**
 * Returns true if the given value is an AllowPolicy resource.
 */
export declare const isAllowPolicy: (value: unknown) => value is AllowPolicy;
export declare const AllowPolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<AllowPolicy>, never, CloudflareEnvironment | emailSecurity.CloudflareOpContext>;
export {};
//# sourceMappingURL=AllowPolicy.d.ts.map