import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface DomainNameProps {
    /**
     * The custom domain name, e.g. `api.example.com`. Changing it triggers
     * a replacement.
     */
    domainName: string;
    /**
     * ARN of an ACM certificate covering the domain. AppSync custom domains
     * are CloudFront-backed, so the certificate **must live in us-east-1**.
     * Changing it triggers a replacement.
     */
    certificateArn: string;
    /** Description of the domain. */
    description?: string;
    /** Tags to apply. Merged with internal Alchemy tags. */
    tags?: Record<string, string>;
}
export interface AppSyncDomainName extends Resource<"AWS.AppSync.DomainName", DomainNameProps, {
    /** The custom domain name. */
    domainName: string;
    /** The domain name ARN. */
    domainNameArn: string | undefined;
    /** The certificate ARN. */
    certificateArn: string;
    /**
     * The CloudFront target (`dxxxx.cloudfront.net`) to point a CNAME /
     * Route53 alias at.
     */
    appsyncDomainName: string | undefined;
    /** The Route53 hosted zone ID for alias records. */
    hostedZoneId: string | undefined;
}, never, Providers> {
}
/**
 * A custom domain name for AppSync GraphQL APIs.
 *
 * Requires an ACM certificate **in us-east-1** (the domain is
 * CloudFront-backed). Attach an API with {@link ApiAssociation} and point
 * DNS at the `appsyncDomainName` attribute.
 * ### Creating Custom Domains
 * **Example:** Custom domain + API association
 * ```typescript
 * const domain = yield* AppSync.DomainName("Domain", {
 *   domainName: "api.example.com",
 *   certificateArn: usEast1Cert.certificateArn,
 * });
 * yield* AppSync.ApiAssociation("Assoc", { domain, api });
 * // CNAME api.example.com → domain.appsyncDomainName
 * ```
 *
 * @resource
 */
export declare const DomainName: import("../../Resource.ts").ResourceClass<AppSyncDomainName>;
export declare const DomainNameProvider: () => import("effect/Layer").Layer<Provider.Provider<AppSyncDomainName>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DomainName.d.ts.map