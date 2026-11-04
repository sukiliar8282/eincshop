import type * as cloudfront from "@distilled.cloud/aws/cloudfront";
import * as Effect from "effect/Effect";
import type { Input } from "../../Input.ts";
import { Certificate } from "../ACM/Certificate.ts";
import { Distribution } from "../CloudFront/Distribution.ts";
import { Invalidation } from "../CloudFront/Invalidation.ts";
import { OriginAccessControl } from "../CloudFront/OriginAccessControl.ts";
import type { Service } from "../ECS/Service.ts";
import { Function } from "../Lambda/Function.ts";
import { Record as Route53Record } from "../Route53/Record.ts";
import { Bucket } from "../S3/Bucket.ts";
import type { AssetFileOption } from "./AssetDeployment.ts";
import { AssetDeployment } from "./AssetDeployment.ts";
import { type SsrSiteRouteTargets, type WebsiteInvalidationProps, type WebsiteStandaloneDomainProps } from "./shared.ts";
/**
 * The dynamic origin CloudFront forwards requests to: a Lambda Function URL,
 * a public ECS Service, or any plain URL.
 */
export type SsrSiteServerOrigin = {
    type: "lambda";
    /**
     * Lambda Function created with `functionUrl` enabled — its function URL
     * becomes the origin.
     */
    function: Function;
    /**
     * Protocol CloudFront uses to reach the origin.
     * @default "https-only"
     */
    originProtocolPolicy?: "https-only";
} | {
    type: "ecs";
    /**
     * ECS Service created with `public: true` — its load balancer URL
     * becomes the origin.
     */
    service: Service;
    /**
     * Protocol CloudFront uses to reach the origin.
     * @default "https-only"
     */
    originProtocolPolicy?: "http-only" | "https-only" | "match-viewer";
} | {
    type: "url";
    /**
     * Origin URL to forward requests to.
     */
    url: Input<string>;
    /**
     * Protocol CloudFront uses to reach the origin.
     * @default "https-only"
     */
    originProtocolPolicy?: cloudfront.OriginProtocolPolicy;
};
export interface SsrSiteProps {
    /**
     * Dynamic server origin behind CloudFront.
     */
    server: SsrSiteServerOrigin;
    /**
     * Optional custom domain managed through Route 53. A string is shorthand
     * for `{ name }`; `null` explicitly clears a previously set domain.
     */
    domain?: string | WebsiteStandaloneDomainProps | null;
    /**
     * Optional static asset bundle to serve from S3.
     */
    assets?: {
        /**
         * Local build output directory to upload.
         */
        sourcePath: Input<string>;
        /**
         * Optional deterministic S3 bucket name.
         */
        bucketName?: string;
        /**
         * Optional asset key prefix.
         */
        prefix?: string;
        /**
         * Path pattern that should be served from the asset bucket.
         * @default "/_assets/*"
         */
        pathPattern?: string;
        /**
         * Remove stale files under the prefix.
         * @default false
         */
        purge?: boolean;
        /**
         * Optional file overrides.
         */
        fileOptions?: AssetFileOption[];
    };
    /**
     * CloudFront cache policy ID for the dynamic server route.
     * @default CloudFront managed CachingDisabled
     */
    cachePolicyId?: Input<string>;
    /**
     * Cache invalidation behavior for asset updates.
     * @default false
     */
    invalidate?: false | WebsiteInvalidationProps;
    /**
     * Whether to create a standalone CloudFront distribution for the site.
     * Set this to `false` when the site should be routed through `AWS.Website.Router`.
     * @default true
     */
    cdn?: boolean;
    /**
     * User-defined tags applied to created resources.
     */
    tags?: Record<string, string>;
}
/**
 * A server-rendered website behind CloudFront.
 *
 * `SsrSite` serves a dynamic origin behind CloudFront and can optionally split
 * immutable static assets into a private S3 bucket origin.
 * ### Creating SSR Sites
 * **Example:** Lambda URL Origin
 * ```typescript
 * const site = yield* SsrSite("App", {
 *   server: {
 *     type: "lambda",
 *     function: appFunction,
 *   },
 * });
 * ```
 *
 * **Example:** SSR With Static Assets
 * ```typescript
 * const site = yield* SsrSite("App", {
 *   server: {
 *     type: "lambda",
 *     function: appFunction,
 *   },
 *   assets: {
 *     sourcePath: "./dist/client",
 *   },
 * });
 * ```
 *
 * ### Custom Domains
 * **Example:** SSR Site With A Route 53 Domain
 * ```typescript
 * const site = yield* SsrSite("App", {
 *   server: {
 *     type: "ecs",
 *     service: webService,
 *   },
 *   domain: {
 *     name: "app.example.com",
 *     hostedZoneId: zone.hostedZoneId,
 *   },
 * });
 * ```
 *
 * ### Router Composition
 * **Example:** Route Through An Existing Router
 * ```typescript
 * // Skip the standalone distribution and register the returned
 * // routeTargets on an AWS.Website.Router instead.
 * const site = yield* SsrSite("App", {
 *   server: {
 *     type: "lambda",
 *     function: appFunction,
 *   },
 *   cdn: false,
 * });
 *
 * const router = yield* AWS.Website.Router("WebsiteRouter", {
 *   routes: {
 *     "/*": site.routeTargets.server,
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const SsrSite: (id: string, props: SsrSiteProps) => Effect.Effect<{
    assetBucket: Bucket | undefined;
    assetFiles: AssetDeployment | undefined;
    assetOriginAccessControl: OriginAccessControl | undefined;
    certificate: undefined;
    distribution: undefined;
    records: never[];
    invalidation: undefined;
    routeTargets: SsrSiteRouteTargets;
    url: undefined;
    urls: Input<string>[];
} | {
    assetBucket: Bucket | undefined;
    assetFiles: AssetDeployment | undefined;
    assetOriginAccessControl: OriginAccessControl | undefined;
    certificate: Certificate | {
        certificateArn: Input<string>;
    } | undefined;
    distribution: Distribution;
    records: Route53Record[];
    invalidation: Invalidation | undefined;
    routeTargets: SsrSiteRouteTargets;
    /**
     * The most significant URL the site serves at — always `urls[0]`.
     */
    url: Input<string>;
    /**
     * Every URL that serves this site, most significant first —
     * `[https://<domain.name>?, ...aliases, <CloudFront default
     * domain>]`. Redirect hostnames never appear — they serve no
     * content.
     */
    urls: Input<string>[];
}, Error, import("../Providers.ts").Providers>;
//# sourceMappingURL=SsrSite.d.ts.map