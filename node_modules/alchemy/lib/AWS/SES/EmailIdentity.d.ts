import * as sesv2 from "@distilled.cloud/aws/sesv2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * The length of the RSA key pair SES generates for Easy DKIM signing.
 */
export type DkimSigningKeyLength = "RSA_1024_BIT" | "RSA_2048_BIT";
export interface EmailIdentityProps {
    /**
     * The email address or domain to verify with SES, e.g. `hello@example.com`
     * or `example.com`. Changing this replaces the identity.
     *
     * - **Email address** — SES sends a verification email to the address; the
     *   identity stays `PENDING` until the link is clicked.
     * - **Domain** — SES generates Easy DKIM tokens (see the `dkimTokens`
     *   attribute) that must be published as CNAME records; the identity stays
     *   `PENDING` until the DNS records propagate.
     */
    emailIdentity: string;
    /**
     * The configuration set to apply by default to messages sent from this
     * identity. The configuration set must exist in the same region.
     */
    configurationSetName?: string;
    /**
     * The length of the private key SES uses for Easy DKIM signing. Only
     * applies to domain identities.
     * @default "RSA_2048_BIT"
     */
    dkimSigningKeyLength?: DkimSigningKeyLength;
    /**
     * Whether Easy DKIM signing is enabled for the identity. Leave undefined to
     * keep SES's current setting.
     */
    dkimSigningEnabled?: boolean;
    /**
     * Whether SES forwards bounce and complaint feedback to the identity's email
     * address. Leave undefined to keep SES's current setting.
     * @default true
     */
    feedbackForwardingEnabled?: boolean;
    /**
     * A custom MAIL FROM domain (a verified subdomain of the identity) SES uses
     * in the message envelope. Publish the required MX and SPF records for the
     * subdomain to complete setup. Leave undefined to keep SES's current
     * setting — there is no removal path once one is configured.
     */
    mailFromDomain?: string;
    /**
     * What SES does when the custom MAIL FROM domain's MX record can't be read:
     * fall back to the SES default (`USE_DEFAULT_VALUE`) or reject the message
     * (`REJECT_MESSAGE`).
     * @default "USE_DEFAULT_VALUE"
     */
    mailFromBehaviorOnMxFailure?: sesv2.BehaviorOnMxFailure;
    /**
     * Tags to apply to the identity. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface EmailIdentity extends Resource<"AWS.SES.EmailIdentity", EmailIdentityProps, {
    emailIdentity: string;
    identityArn: string;
    identityType: sesv2.IdentityType;
    verifiedForSendingStatus: boolean;
    verificationStatus: sesv2.VerificationStatus | undefined;
    /**
     * The Easy DKIM CNAME tokens for a domain identity. Publish each token as
     * `{token}._domainkey.{domain} CNAME {token}.dkim.amazonses.com` to
     * complete verification. Empty for email-address identities.
     */
    dkimTokens: string[];
    dkimStatus: sesv2.DkimStatus | undefined;
}, never, Providers> {
}
/**
 * An Amazon SES v2 email identity — a verified email address or domain that
 * you send email from.
 *
 * Creating the identity starts verification: email-address identities receive
 * a verification email, and domain identities get Easy DKIM tokens (exposed
 * as the `dkimTokens` attribute) to publish as CNAME records. The identity
 * is usable for sending once `verificationStatus` is `SUCCESS`.
 * ### Creating Identities
 * **Example:** Domain Identity
 * ```typescript
 * import * as SES from "alchemy/AWS/SES";
 *
 * const identity = yield* SES.EmailIdentity("Sender", {
 *   emailIdentity: "mail.example.com",
 * });
 * // publish identity.dkimTokens as CNAME records to verify
 * ```
 *
 * **Example:** Email Address Identity
 * ```typescript
 * const identity = yield* SES.EmailIdentity("Sender", {
 *   emailIdentity: "hello@example.com",
 * });
 * // SES emails hello@example.com a verification link
 * ```
 *
 * ### Configuration Set Association
 * **Example:** Apply a Configuration Set by Default
 * ```typescript
 * const configSet = yield* SES.ConfigurationSet("Tracking", {});
 * const identity = yield* SES.EmailIdentity("Sender", {
 *   emailIdentity: "mail.example.com",
 *   configurationSetName: configSet.configurationSetName,
 * });
 * ```
 *
 * ### DKIM and Feedback
 * **Example:** Turn Easy DKIM Signing Off
 * ```typescript
 * // Omit the prop entirely to leave SES's current setting alone.
 * const identity = yield* SES.EmailIdentity("Sender", {
 *   emailIdentity: "mail.example.com",
 *   dkimSigningEnabled: false,
 * });
 * ```
 *
 * **Example:** Stop Forwarding Bounces and Complaints by Email
 * ```typescript
 * // Turn this off once a configuration set event destination is handling
 * // bounces and complaints, so they stop arriving as mail.
 * const identity = yield* SES.EmailIdentity("Sender", {
 *   emailIdentity: "mail.example.com",
 *   feedbackForwardingEnabled: false,
 * });
 * ```
 *
 * ### Custom MAIL FROM Domain
 * **Example:** Send with Your Own Envelope Domain
 * ```typescript
 * // mailFromDomain must be a subdomain of the identity, and needs MX and
 * // SPF records published before SES will use it.
 * const identity = yield* SES.EmailIdentity("Sender", {
 *   emailIdentity: "mail.example.com",
 *   mailFromDomain: "bounce.mail.example.com",
 *   // Reject rather than silently falling back to the SES default when the
 *   // MX record cannot be read.
 *   mailFromBehaviorOnMxFailure: "REJECT_MESSAGE",
 * });
 * ```
 *
 * ### Sending Email at Runtime
 * **Example:** Send Through the Identity from a Lambda Function
 * ```typescript
 * // init
 * const sendEmail = yield* SES.SendEmail(identity);
 *
 * // runtime
 * const result = yield* sendEmail({
 *   FromEmailAddress: "hello@mail.example.com",
 *   Destination: { ToAddresses: ["customer@example.com"] },
 *   Content: {
 *     Simple: {
 *       Subject: { Data: "Welcome!" },
 *       Body: { Text: { Data: "Hello from SES." } },
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const EmailIdentity: import("../../Resource.ts").ResourceClass<EmailIdentity>;
export declare const EmailIdentityProvider: () => import("effect/Layer").Layer<Provider.Provider<EmailIdentity>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=EmailIdentity.d.ts.map