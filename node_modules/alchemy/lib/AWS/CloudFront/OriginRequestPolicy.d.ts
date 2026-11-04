import * as cloudfront from "@distilled.cloud/aws/cloudfront";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface OriginRequestPolicyProps {
    /**
     * Name of the origin request policy. If omitted, a deterministic name is
     * generated. Names must be unique per AWS account. Changing the name
     * triggers a replacement.
     */
    name?: string;
    /**
     * Optional comment describing the policy.
     */
    comment?: string;
    /**
     * Headers to forward to the origin (in addition to the cache key).
     */
    headersConfig: cloudfront.OriginRequestPolicyHeadersConfig;
    /**
     * Cookies to forward to the origin (in addition to the cache key).
     */
    cookiesConfig: cloudfront.OriginRequestPolicyCookiesConfig;
    /**
     * Query strings to forward to the origin (in addition to the cache key).
     */
    queryStringsConfig: cloudfront.OriginRequestPolicyQueryStringsConfig;
}
export interface OriginRequestPolicy extends Resource<"AWS.CloudFront.OriginRequestPolicy", OriginRequestPolicyProps, {
    /**
     * CloudFront-assigned origin request policy identifier.
     */
    originRequestPolicyId: string;
    /**
     * Name of the origin request policy.
     */
    name: string;
    /**
     * Most recent entity tag for update/delete operations.
     */
    etag: string | undefined;
    /**
     * Current comment on the policy.
     */
    comment: string | undefined;
    /**
     * Current headers configuration.
     */
    headersConfig: cloudfront.OriginRequestPolicyHeadersConfig;
    /**
     * Current cookies configuration.
     */
    cookiesConfig: cloudfront.OriginRequestPolicyCookiesConfig;
    /**
     * Current query strings configuration.
     */
    queryStringsConfig: cloudfront.OriginRequestPolicyQueryStringsConfig;
}, never, Providers> {
}
/**
 * A CloudFront origin request policy.
 *
 * Origin request policies control which values from the viewer request (in
 * addition to those used in the cache key) CloudFront includes when sending
 * a request to the origin. They are referenced by ID on a Distribution's
 * default behavior or per-path cache behaviors.
 * ### Creating Origin Request Policies
 * **Example:** Forward all viewer headers and cookies
 * ```typescript
 * const originRequestPolicy = yield* OriginRequestPolicy("AppOriginRequest", {
 *   comment: "Forward auth + locale",
 *   headersConfig: {
 *     HeaderBehavior: "whitelist",
 *     Headers: { Quantity: 2, Items: ["Authorization", "Accept-Language"] },
 *   },
 *   cookiesConfig: { CookieBehavior: "all" },
 *   queryStringsConfig: { QueryStringBehavior: "all" },
 * });
 * ```
 *
 * @resource
 */
export declare const OriginRequestPolicy: import("../../Resource.ts").ResourceClass<OriginRequestPolicy>;
export declare const OriginRequestPolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<OriginRequestPolicy>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=OriginRequestPolicy.d.ts.map