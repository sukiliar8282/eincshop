import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface UserPoolDomainProps {
    /**
     * The ID of the user pool the domain serves. Changing this triggers a
     * replacement.
     */
    userPoolId: string;
    /**
     * The domain prefix (for `<prefix>.auth.<region>.amazoncognito.com`) or
     * the full custom domain name when `certificateArn` is set. Prefixes must
     * be lowercase alphanumeric/hyphens and globally unique per region. If
     * omitted, a deterministic prefix is generated from the app, stage, and
     * logical ID. Changing this triggers a replacement.
     */
    domain?: string;
    /**
     * ARN of an ACM certificate in us-east-1 for a custom domain. Custom
     * domains can take 15-60 minutes to distribute.
     */
    certificateArn?: string;
    /**
     * The branding version served by the domain: `1` for hosted UI (classic),
     * `2` for managed login.
     * @default 2
     */
    managedLoginVersion?: number;
}
export interface UserPoolDomain extends Resource<"AWS.Cognito.UserPoolDomain", UserPoolDomainProps, {
    /** The domain prefix or full custom domain name. */
    domain: string;
    /** The ID of the user pool the domain serves. */
    userPoolId: string;
    /**
     * The CloudFront distribution domain fronting the hosted endpoint —
     * for custom domains, point a DNS alias record here.
     */
    cloudFrontDomain: string | undefined;
}, never, Providers> {
}
/**
 * A domain for an Amazon Cognito user pool's managed login and OAuth 2.0
 * authorization server. Cognito-prefix domains
 * (`<prefix>.auth.<region>.amazoncognito.com`) provision in seconds; custom
 * domains require an ACM certificate in us-east-1 and can take 15-60 minutes.
 * ### Creating a Domain
 * **Example:** Cognito-Prefix Domain
 * ```typescript
 * import * as Cognito from "alchemy/AWS/Cognito";
 *
 * const pool = yield* Cognito.UserPool("Users", {});
 * const domain = yield* Cognito.UserPoolDomain("AuthDomain", {
 *   userPoolId: pool.userPoolId,
 * });
 * ```
 *
 * **Example:** Explicit Prefix
 * ```typescript
 * const domain = yield* Cognito.UserPoolDomain("AuthDomain", {
 *   userPoolId: pool.userPoolId,
 *   domain: "my-app-auth",
 * });
 * ```
 *
 * ### Custom Domains
 * **Example:** Custom Domain with an ACM Certificate
 * ```typescript
 * const domain = yield* Cognito.UserPoolDomain("AuthDomain", {
 *   userPoolId: pool.userPoolId,
 *   domain: "auth.example.com",
 *   certificateArn: certificate.certificateArn, // must be us-east-1
 * });
 * ```
 *
 * @resource
 */
export declare const UserPoolDomain: import("../../Resource.ts").ResourceClass<UserPoolDomain>;
export declare const UserPoolDomainProvider: () => import("effect/Layer").Layer<Provider.Provider<UserPoolDomain>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=UserPoolDomain.d.ts.map