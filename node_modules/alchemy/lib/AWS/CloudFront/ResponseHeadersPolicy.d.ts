import * as cloudfront from "@distilled.cloud/aws/cloudfront";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ResponseHeadersPolicyProps {
    /**
     * Name of the response headers policy. If omitted, a deterministic name is
     * generated. Names must be unique per AWS account. Changing the name
     * triggers a replacement.
     */
    name?: string;
    /**
     * Optional comment describing the policy.
     */
    comment?: string;
    /**
     * CORS configuration applied to viewer responses.
     */
    corsConfig?: cloudfront.ResponseHeadersPolicyCorsConfig;
    /**
     * Standard security headers (HSTS, X-Frame-Options, etc.) added to
     * viewer responses.
     */
    securityHeadersConfig?: cloudfront.ResponseHeadersPolicySecurityHeadersConfig;
    /**
     * Server-Timing header configuration for measuring CloudFront performance.
     */
    serverTimingHeadersConfig?: cloudfront.ResponseHeadersPolicyServerTimingHeadersConfig;
    /**
     * Custom headers to add to viewer responses.
     */
    customHeadersConfig?: cloudfront.ResponseHeadersPolicyCustomHeadersConfig;
    /**
     * Headers to remove from viewer responses.
     */
    removeHeadersConfig?: cloudfront.ResponseHeadersPolicyRemoveHeadersConfig;
}
export interface ResponseHeadersPolicy extends Resource<"AWS.CloudFront.ResponseHeadersPolicy", ResponseHeadersPolicyProps, {
    /**
     * CloudFront-assigned response headers policy identifier.
     */
    responseHeadersPolicyId: string;
    /**
     * Name of the response headers policy.
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
     * Current CORS configuration.
     */
    corsConfig: cloudfront.ResponseHeadersPolicyCorsConfig | undefined;
    /**
     * Current security headers configuration.
     */
    securityHeadersConfig: cloudfront.ResponseHeadersPolicySecurityHeadersConfig | undefined;
    /**
     * Current Server-Timing configuration.
     */
    serverTimingHeadersConfig: cloudfront.ResponseHeadersPolicyServerTimingHeadersConfig | undefined;
    /**
     * Current custom headers configuration.
     */
    customHeadersConfig: cloudfront.ResponseHeadersPolicyCustomHeadersConfig | undefined;
    /**
     * Current remove-headers configuration.
     */
    removeHeadersConfig: cloudfront.ResponseHeadersPolicyRemoveHeadersConfig | undefined;
}, never, Providers> {
}
/**
 * A CloudFront response headers policy.
 *
 * Response headers policies add or remove headers in viewer responses,
 * including CORS, standard security headers (HSTS, X-Frame-Options,
 * X-Content-Type-Options, Referrer-Policy, etc.), Server-Timing, custom
 * headers and explicit header removal. They are referenced by ID on a
 * Distribution's default behavior or per-path cache behaviors.
 * ### Creating Response Headers Policies
 * **Example:** Standard security + CORS
 * ```typescript
 * const responseHeadersPolicy = yield* ResponseHeadersPolicy("AppResponseHeaders", {
 *   comment: "Default app security + CORS",
 *   corsConfig: {
 *     AccessControlAllowOrigins: { Quantity: 1, Items: ["https://app.example.com"] },
 *     AccessControlAllowMethods: { Quantity: 2, Items: ["GET", "OPTIONS"] },
 *     AccessControlAllowHeaders: { Quantity: 1, Items: ["Authorization"] },
 *     AccessControlAllowCredentials: false,
 *     OriginOverride: true,
 *   },
 *   securityHeadersConfig: {
 *     StrictTransportSecurity: {
 *       AccessControlMaxAgeSec: 31536000,
 *       IncludeSubdomains: true,
 *       Preload: true,
 *       Override: true,
 *     },
 *     ContentTypeOptions: { Override: true },
 *     FrameOptions: { FrameOption: "DENY", Override: true },
 *     ReferrerPolicy: { ReferrerPolicy: "no-referrer", Override: true },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const ResponseHeadersPolicy: import("../../Resource.ts").ResourceClass<ResponseHeadersPolicy>;
export declare const ResponseHeadersPolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<ResponseHeadersPolicy>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ResponseHeadersPolicy.d.ts.map