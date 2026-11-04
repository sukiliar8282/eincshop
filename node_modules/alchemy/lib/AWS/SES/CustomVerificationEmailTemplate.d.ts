import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface CustomVerificationEmailTemplateProps {
    /**
     * Name of the template. May contain letters, numbers, dashes and
     * underscores, up to 64 characters. If omitted, a deterministic physical
     * name is generated from the app, stage, and logical ID. Changing the name
     * replaces the template.
     */
    templateName?: string;
    /**
     * The verified email address the verification email is sent from. The
     * identity must already be verified for sending.
     */
    fromEmailAddress: string;
    /**
     * The subject line of the verification email.
     */
    templateSubject: string;
    /**
     * The HTML body of the verification email. Must contain a link to the
     * verification URL SES generates.
     */
    templateContent: string;
    /**
     * The URL the recipient is redirected to after successfully verifying.
     */
    successRedirectionURL: string;
    /**
     * The URL the recipient is redirected to if verification fails.
     */
    failureRedirectionURL: string;
    /**
     * Tags to apply to the template. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface CustomVerificationEmailTemplate extends Resource<"AWS.SES.CustomVerificationEmailTemplate", CustomVerificationEmailTemplateProps, {
    /** Name of the template. */
    templateName: string;
}, never, Providers> {
}
/**
 * An Amazon SES v2 custom verification email template — the branded email SES
 * sends when you verify a new email-address identity via
 * `SendCustomVerificationEmail`.
 *
 * Creating, reading, updating, and deleting the template works on any account.
 * Actually *sending* a custom verification email requires the account to be
 * out of the SES sandbox (production access).
 * ### Creating Templates
 * **Example:** Branded Verification Email
 * ```typescript
 * import * as SES from "alchemy/AWS/SES";
 *
 * const template = yield* SES.CustomVerificationEmailTemplate("Verify", {
 *   fromEmailAddress: "verify@example.com",
 *   templateSubject: "Please confirm your email",
 *   templateContent:
 *     "<html><body>Click the link to verify your address.</body></html>",
 *   successRedirectionURL: "https://example.com/verified",
 *   failureRedirectionURL: "https://example.com/verify-failed",
 * });
 * ```
 *
 * **Example:** Explicit Template Name
 * ```typescript
 * // Without templateName a deterministic name is derived from app/stage/id.
 * const template = yield* SES.CustomVerificationEmailTemplate("Verify", {
 *   templateName: "onboarding-verification",
 *   fromEmailAddress: "verify@example.com",
 *   templateSubject: "Please confirm your email",
 *   templateContent:
 *     "<html><body>Click the link to verify your address.</body></html>",
 *   successRedirectionURL: "https://example.com/verified",
 *   failureRedirectionURL: "https://example.com/verify-failed",
 * });
 * ```
 *
 * ### Sending the Verification Email
 * **Example:** Verify a New Address from a Lambda Function
 * ```typescript
 * // init — account-level binding, no resource argument
 * const sendVerification = yield* SES.SendCustomVerificationEmail();
 *
 * // runtime — SES emails the branded template to the address, and the
 * // address becomes a verified identity once the recipient clicks through.
 * const { MessageId } = yield* sendVerification({
 *   EmailAddress: "new-user@example.com",
 *   TemplateName: yield* template.templateName,
 * });
 * ```
 *
 * @resource
 */
export declare const CustomVerificationEmailTemplate: import("../../Resource.ts").ResourceClass<CustomVerificationEmailTemplate>;
export declare const CustomVerificationEmailTemplateProvider: () => import("effect/Layer").Layer<Provider.Provider<CustomVerificationEmailTemplate>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=CustomVerificationEmailTemplate.d.ts.map