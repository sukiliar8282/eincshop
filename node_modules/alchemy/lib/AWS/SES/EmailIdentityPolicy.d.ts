import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { type PolicyDocument } from "../IAM/Policy.ts";
import type { Providers } from "../Providers.ts";
export interface EmailIdentityPolicyProps {
    /**
     * The email address or domain identity the sending-authorization policy is
     * attached to. Typically the `emailIdentity` output of a
     * `SES.EmailIdentity`. Changing it replaces the policy.
     */
    emailIdentity: string;
    /**
     * Name of the policy. May contain letters, numbers, dashes and underscores,
     * up to 64 characters. If omitted, a deterministic physical name is
     * generated from the app, stage, and logical ID. Changing it replaces the
     * policy.
     */
    policyName?: string;
    /**
     * The IAM policy document that grants sending authorization. Equivalent
     * document representations are ignored when detecting drift.
     */
    policy: PolicyDocument;
}
export interface EmailIdentityPolicy extends Resource<"AWS.SES.EmailIdentityPolicy", EmailIdentityPolicyProps, {
    /** The identity the policy is attached to. */
    emailIdentity: string;
    /** Name of the policy. */
    policyName: string;
}, never, Providers> {
}
/**
 * An Amazon SES v2 sending-authorization policy attached to an email identity —
 * lets the identity owner authorize other AWS accounts or IAM principals to
 * send email using the identity.
 *
 * SES stores the policy document as JSON; Alchemy serializes the typed IAM
 * policy at the API boundary and compares its normalized content for drift.
 * ### Attaching a Policy
 * **Example:** Authorize Another Account to Send
 * ```typescript
 * import * as SES from "alchemy/AWS/SES";
 *
 * const identity = yield* SES.EmailIdentity("Sender", {
 *   emailIdentity: "mail.example.com",
 * });
 *
 * const policy = yield* SES.EmailIdentityPolicy("AllowPartner", {
 *   emailIdentity: identity.emailIdentity,
 *   policy: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { AWS: "arn:aws:iam::111122223333:root" },
 *         Action: ["ses:SendEmail"],
 *         Resource: identity.identityArn,
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * **Example:** Explicit Policy Name
 * ```typescript
 * // Without policyName a deterministic name is derived from app/stage/id.
 * const policy = yield* SES.EmailIdentityPolicy("AllowPartner", {
 *   emailIdentity: identity.emailIdentity,
 *   policyName: "partner-send",
 *   policy: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { AWS: "arn:aws:iam::111122223333:root" },
 *         Action: ["ses:SendEmail"],
 *         Resource: identity.identityArn,
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * **Example:** Restrict the Grant with Conditions
 * ```typescript
 * const policy = yield* SES.EmailIdentityPolicy("AllowPartnerScoped", {
 *   emailIdentity: identity.emailIdentity,
 *   policy: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { AWS: "arn:aws:iam::111122223333:root" },
 *         Action: ["ses:SendEmail", "ses:SendRawEmail"],
 *         Resource: identity.identityArn,
 *         Condition: {
 *           StringEquals: { "ses:FromAddress": "noreply@mail.example.com" },
 *         },
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * **Example:** Several Policies on One Identity
 * ```typescript
 * // Each policy is a separate resource keyed by its own name.
 * for (const partner of ["111122223333", "444455556666"]) {
 *   yield* SES.EmailIdentityPolicy(`Allow${partner}`, {
 *     emailIdentity: identity.emailIdentity,
 *     policyName: `partner-${partner}`,
 *     policy: {
 *       Version: "2012-10-17",
 *       Statement: [
 *         {
 *           Effect: "Allow",
 *           Principal: { AWS: `arn:aws:iam::${partner}:root` },
 *           Action: ["ses:SendEmail"],
 *           Resource: identity.identityArn,
 *         },
 *       ],
 *     },
 *   });
 * }
 * ```
 *
 * @resource
 */
export declare const EmailIdentityPolicy: import("../../Resource.ts").ResourceClass<EmailIdentityPolicy>;
export declare const EmailIdentityPolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<EmailIdentityPolicy>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=EmailIdentityPolicy.d.ts.map