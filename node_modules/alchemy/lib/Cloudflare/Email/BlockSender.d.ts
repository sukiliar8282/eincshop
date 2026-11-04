import * as emailSecurity from "@distilled.cloud/cloudflare/email-security";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
import type { PatternType } from "./AllowPolicy.ts";
declare const EmailSecurityBlockSenderTypeId: "Cloudflare.Email.BlockSender";
type EmailSecurityBlockSenderTypeId = typeof EmailSecurityBlockSenderTypeId;
export interface BlockSenderProps {
    /**
     * The email address, domain, IP, or regular expression to block.
     * The pattern is the entry's identity for cold-state recovery — a
     * pre-existing entry with the same pattern is reported as unowned and
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
     * Free-form notes about the blocked sender.
     */
    comments?: string;
}
export interface BlockSenderAttributes {
    /** Cloudflare-assigned blocked sender pattern identifier. */
    blockSenderId: string;
    /** The account the entry belongs to. */
    accountId: string;
    /** The blocked pattern. */
    pattern: string;
    /** Type of pattern matching. */
    patternType: PatternType;
    /** Whether the pattern is a regular expression. */
    isRegex: boolean;
    /** Free-form notes about the entry, if set. */
    comments: string | undefined;
    /** ISO8601 creation timestamp. */
    createdAt: string;
    /** ISO8601 last-modified timestamp, if the entry has been modified. */
    modifiedAt: string | undefined;
}
export type BlockSender = Resource<EmailSecurityBlockSenderTypeId, BlockSenderProps, BlockSenderAttributes, never, Providers>;
/**
 * A Cloudflare Email Security (Area 1) blocked sender — messages matching
 * the pattern are blocked before delivery.
 *
 * All fields are mutable in place. Requires the Email Security enterprise
 * add-on; accounts without the entitlement receive the typed
 * `EmailSecurityNotEntitled` error.
 * ### Blocking Senders
 * **Example:** Block a single email address
 * ```typescript
 * yield* Cloudflare.Email.BlockSender("KnownPhisher", {
 *   pattern: "phisher@malicious.example.com",
 *   patternType: "EMAIL",
 *   comments: "reported in incident 1234",
 * });
 * ```
 *
 * **Example:** Block a whole sending domain
 * ```typescript
 * yield* Cloudflare.Email.BlockSender("SpamDomain", {
 *   pattern: "spam-source.example.net",
 *   patternType: "DOMAIN",
 * });
 * ```
 *
 * **Example:** Block by regular expression
 * ```typescript
 * yield* Cloudflare.Email.BlockSender("LookalikeSenders", {
 *   pattern: ".*@examp1e\\.com$",
 *   patternType: "EMAIL",
 *   isRegex: true,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/email-security/
 *
 * @resource
 * @product Email Security
 * @category Email
 */
export declare const BlockSender: import("../../Resource.ts").ResourceClass<BlockSender>;
/**
 * Returns true if the given value is an BlockSender resource.
 */
export declare const isBlockSender: (value: unknown) => value is BlockSender;
export declare const BlockSenderProvider: () => import("effect/Layer").Layer<Provider.Provider<BlockSender>, never, CloudflareEnvironment | emailSecurity.CloudflareOpContext>;
export {};
//# sourceMappingURL=BlockSender.d.ts.map