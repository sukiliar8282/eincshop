import * as cloudfront from "@distilled.cloud/aws/cloudfront";
import type * as Duration from "effect/Duration";
import * as HttpClient from "effect/unstable/http/HttpClient";
import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import { AWSEnvironment } from "../Environment.ts";
export interface DistributionOrigin {
    /**
     * Unique origin identifier inside the distribution.
     */
    id: string;
    /**
     * Origin domain name.
     */
    domainName: Input<string>;
    /**
     * Optional origin path prefix.
     */
    originPath?: Input<string>;
    /**
     * CloudFront Origin Access Control identifier.
     */
    originAccessControlId?: Input<string>;
    /**
     * Whether the origin should be modeled as an S3 origin.
     * @default false
     */
    s3Origin?: boolean;
    /**
     * Explicit S3 origin settings (legacy Origin Access Identity, read timeout).
     * When set, the origin is treated as an S3 origin regardless of `s3Origin`.
     */
    s3OriginConfig?: {
        originAccessIdentity?: string;
        originReadTimeout?: Duration.Input;
    };
    /**
     * Optional custom origin settings.
     */
    customOriginConfig?: {
        httpPort?: number;
        httpsPort?: number;
        originProtocolPolicy?: cloudfront.OriginProtocolPolicy;
        originReadTimeout?: Duration.Input;
        originKeepaliveTimeout?: Duration.Input;
        originSslProtocols?: cloudfront.SslProtocol[];
        /**
         * IP address type CloudFront uses to connect to the origin.
         */
        ipAddressType?: cloudfront.IpAddressType;
        /**
         * Mutual TLS configuration for the origin connection.
         */
        originMtlsConfig?: {
            clientCertificateArn: string;
        };
    };
    /**
     * Route this origin through a VPC origin (private ALB/NLB/EC2). Mutually
     * exclusive with `s3Origin`/`s3OriginConfig`/`customOriginConfig`.
     */
    vpcOriginConfig?: {
        vpcOriginId: Input<string>;
        originReadTimeout?: Duration.Input;
        originKeepaliveTimeout?: Duration.Input;
        ownerAccountId?: string;
    };
    /**
     * Custom headers CloudFront adds to every request it sends to the origin.
     */
    customHeaders?: Record<string, string>;
    /**
     * Origin Shield configuration.
     */
    originShield?: {
        enabled: boolean;
        originShieldRegion?: string;
    };
    /**
     * Number of times CloudFront attempts to connect to the origin (1-3).
     */
    connectionAttempts?: number;
    /**
     * How long CloudFront waits when trying to establish a connection (1-10
     * seconds), e.g. `"5 seconds"` (a bare number is milliseconds).
     */
    connectionTimeout?: Duration.Input;
    /**
     * How long CloudFront waits for the origin to deliver a complete response,
     * e.g. `"30 seconds"` (a bare number is milliseconds).
     */
    responseCompletionTimeout?: Duration.Input;
}
export interface DistributionBehavior {
    /**
     * ID of the origin (or origin group) this behavior routes requests to.
     */
    targetOriginId: string;
    /**
     * How viewers may connect (e.g. `redirect-to-https`, `https-only`).
     */
    viewerProtocolPolicy?: cloudfront.ViewerProtocolPolicy;
    /**
     * HTTP methods CloudFront accepts and forwards to the origin.
     */
    allowedMethods?: cloudfront.Method[];
    /**
     * HTTP methods whose responses CloudFront caches.
     */
    cachedMethods?: cloudfront.Method[];
    /**
     * Whether CloudFront automatically compresses eligible responses.
     */
    compress?: boolean;
    /**
     * Cache policy ID (a managed policy or a `CachePolicy`) controlling the
     * cache key and TTLs.
     */
    cachePolicyId?: string;
    /**
     * Origin request policy ID controlling which viewer values CloudFront
     * forwards to the origin.
     */
    originRequestPolicyId?: string;
    /**
     * Response headers policy ID applied to viewer responses.
     */
    responseHeadersPolicyId?: string;
    /**
     * Legacy forwarded-values settings. Prefer `cachePolicyId` /
     * `originRequestPolicyId` for new configurations.
     */
    forwardedValues?: cloudfront.ForwardedValues;
    /**
     * Minimum time responses stay cached, e.g. `"1 hour"` (a bare number is
     * milliseconds). Used with `forwardedValues`.
     */
    minTtl?: Duration.Input;
    /**
     * Default time responses stay cached when the origin sends no caching
     * headers.
     */
    defaultTtl?: Duration.Input;
    /**
     * Maximum time responses stay cached.
     */
    maxTtl?: Duration.Input;
    /**
     * CloudFront Functions to run on viewer request/response events.
     */
    functionAssociations?: {
        functionArn: string;
        eventType: cloudfront.EventType;
    }[];
    /**
     * Lambda@Edge functions to run on viewer/origin request/response events.
     */
    lambdaFunctionAssociations?: {
        lambdaFunctionArn: string;
        eventType: cloudfront.EventType;
        includeBody?: boolean;
    }[];
    /**
     * CloudFront KeyGroup IDs whose public keys gate signed URLs/cookies.
     */
    trustedKeyGroups?: Input<string[]>;
    /**
     * Legacy trusted signer AWS account numbers for signed URLs/cookies.
     */
    trustedSigners?: string[];
    /**
     * Field-level encryption configuration ID.
     */
    fieldLevelEncryptionId?: string;
    /**
     * ARN of a real-time log configuration to attach.
     */
    realtimeLogConfigArn?: string;
    /**
     * Whether Microsoft Smooth Streaming is enabled for this behavior.
     */
    smoothStreaming?: boolean;
    /**
     * gRPC configuration for this behavior.
     */
    grpcConfig?: {
        enabled: boolean;
    };
}
export interface DistributionViewerCertificate {
    /**
     * Serve HTTPS with the default `*.cloudfront.net` certificate (no custom
     * domains).
     */
    cloudFrontDefaultCertificate?: boolean;
    /**
     * ARN of an ACM certificate (must live in `us-east-1`) covering the
     * distribution's aliases.
     */
    acmCertificateArn?: string;
    /**
     * How CloudFront serves HTTPS to viewers (`sni-only` for modern clients).
     */
    sslSupportMethod?: cloudfront.SSLSupportMethod;
    /**
     * Minimum TLS protocol version viewers must support.
     */
    minimumProtocolVersion?: cloudfront.MinimumProtocolVersion;
    /**
     * Legacy IAM certificate ID.
     */
    iamCertificateId?: string;
    /**
     * Legacy certificate identifier (IAM/ACM raw value).
     */
    certificate?: string;
    /**
     * Source of the legacy certificate.
     */
    certificateSource?: cloudfront.CertificateSource;
}
export interface DistributionGeoRestriction {
    /**
     * Restriction mode. `none` disables geo restriction.
     */
    restrictionType: cloudfront.GeoRestrictionType;
    /**
     * Two-letter ISO 3166-1 country codes the restriction applies to.
     */
    locations?: string[];
}
export interface DistributionLogging {
    /**
     * Whether access logging is enabled.
     * @default true
     */
    enabled?: boolean;
    /**
     * Whether cookies are included in access logs.
     */
    includeCookies?: boolean;
    /**
     * S3 bucket (domain name) that receives access logs.
     */
    bucket?: string;
    /**
     * Prefix applied to access log object keys.
     */
    prefix?: string;
}
export interface DistributionOriginGroup {
    /**
     * Origin group identifier (target it from a cache behavior).
     */
    id: string;
    /**
     * Member origin IDs in failover order (primary first, secondary second).
     */
    members: string[];
    /**
     * HTTP status codes that trigger failover to the next member.
     */
    failoverStatusCodes: number[];
    /**
     * How CloudFront selects the origin within the group.
     */
    selectionCriteria?: cloudfront.OriginGroupSelectionCriteria;
}
export interface DistributionProps {
    /**
     * Alternate domain names routed to this distribution.
     */
    aliases?: string[];
    /**
     * Default root object served for `/`.
     */
    defaultRootObject?: string;
    /**
     * CloudFront origin definitions.
     */
    origins: Input<DistributionOrigin[]>;
    /**
     * Default cache behavior.
     */
    defaultCacheBehavior: Input<DistributionBehavior>;
    /**
     * Ordered cache behaviors.
     */
    orderedCacheBehaviors?: Input<Array<DistributionBehavior & {
        pathPattern: string;
    }>>;
    /**
     * Custom error response rules.
     */
    customErrorResponses?: Input<cloudfront.CustomErrorResponse[]>;
    /**
     * Human-readable distribution comment.
     * @default ""
     */
    comment?: string;
    /**
     * Whether the distribution should serve traffic.
     * @default true
     */
    enabled?: boolean;
    /**
     * Viewer certificate configuration.
     */
    viewerCertificate?: Input<DistributionViewerCertificate>;
    /**
     * CloudFront price class.
     */
    priceClass?: cloudfront.PriceClass;
    /**
     * Optional AWS WAF web ACL association.
     */
    webAclId?: string;
    /**
     * Preferred HTTP version support.
     */
    httpVersion?: cloudfront.HttpVersion;
    /**
     * Whether IPv6 should be enabled.
     * @default true
     */
    isIpv6Enabled?: boolean;
    /**
     * Geographic distribution restrictions. Defaults to no restriction.
     */
    geoRestriction?: DistributionGeoRestriction;
    /**
     * Standard access logging configuration.
     */
    logging?: DistributionLogging;
    /**
     * Origin failover groups. Target a group id from a cache behavior's
     * `targetOriginId`.
     */
    originGroups?: Input<DistributionOriginGroup[]>;
    /**
     * Continuous deployment policy ID for blue/green deployments.
     */
    continuousDeploymentPolicyId?: string;
    /**
     * Whether this is a staging distribution for blue/green deployments.
     * Create-only — changing it forces a replacement.
     */
    staging?: boolean;
    /**
     * Anycast static IP list ID to associate with the distribution.
     */
    anycastIpListId?: string;
    /**
     * User-defined tags to apply to the distribution.
     */
    tags?: Record<string, string>;
}
/**
 * Binding contract of {@link Distribution}: composites contribute additional
 * alternate domain names without a circular input prop (e.g. a site attached
 * to an `AWS.Website.Router` binds its hostnames onto the Router's
 * distribution). Bound aliases are merged with the declared `aliases` prop
 * at reconcile time; the viewer certificate must cover them.
 */
export type DistributionBinding = {
    /**
     * Additional alternate domain names (CNAMEs) attached to the
     * distribution.
     */
    aliases?: string[];
};
export interface Distribution extends Resource<"AWS.CloudFront.Distribution", DistributionProps, {
    /**
     * CloudFront distribution identifier.
     */
    distributionId: string;
    /**
     * ARN of the distribution.
     */
    distributionArn: string;
    /**
     * CloudFront-assigned domain name.
     */
    domainName: string;
    /**
     * The distribution's own URL — what a viewer opens.
     *
     * `https://{domainName}` on AWS. Under `alchemy dev` the emulator has no
     * such hostname to offer (`*.cloudfront.net` resolves to nothing on a
     * developer's machine), so it serves the distribution's edge on a local
     * port and this is `http://localhost:{port}`. Reading `url` instead of
     * building one from {@link domainName} is what makes a consumer work
     * unchanged in both modes.
     */
    url: string;
    /**
     * Route 53 hosted zone ID for CloudFront aliases.
     */
    hostedZoneId: string;
    /**
     * Current deployment status.
     */
    status: string;
    /**
     * Configured alternate domain names.
     */
    aliases: string[];
    /**
     * Current comment.
     */
    comment: string;
    /**
     * Whether the distribution is enabled.
     */
    enabled: boolean;
    /**
     * Most recent entity tag for update/delete operations.
     */
    etag: string | undefined;
    /**
     * Number of invalidation batches still in progress.
     */
    inProgressInvalidationBatches: number;
    /**
     * Last CloudFront modification timestamp.
     */
    lastModifiedTime: Date | undefined;
    /**
     * Current tags on the distribution.
     */
    tags: Record<string, string>;
}, DistributionBinding, Providers> {
}
/**
 * A CloudFront distribution.
 *
 * `Distribution` manages the CDN layer for static sites and HTTP origins such
 * as Lambda Function URLs and ALBs. It exposes the distribution domain and
 * hosted zone ID needed for Route 53 alias records.
 * ### Creating Distributions
 * **Example:** CDN in Front of an HTTP Origin
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const distribution = yield* AWS.CloudFront.Distribution("ApiCdn", {
 *   origins: [
 *     {
 *       id: "api",
 *       domainName: "abc123.lambda-url.us-west-2.on.aws",
 *       customOriginConfig: { originProtocolPolicy: "https-only" },
 *     },
 *   ],
 *   defaultCacheBehavior: {
 *     targetOriginId: "api",
 *     viewerProtocolPolicy: "redirect-to-https",
 *     cachePolicyId: AWS.CloudFront.MANAGED_CACHING_DISABLED_POLICY_ID,
 *     originRequestPolicyId:
 *       AWS.CloudFront.MANAGED_ALL_VIEWER_EXCEPT_HOST_HEADER_POLICY_ID,
 *   },
 * });
 * ```
 *
 * **Example:** Private S3 Origin
 * ```typescript
 * const distribution = yield* Distribution("WebsiteCdn", {
 *   aliases: ["www.example.com"],
 *   origins: [
 *     {
 *       id: "site",
 *       domainName: bucket.bucketRegionalDomainName,
 *       s3Origin: true,
 *       originAccessControlId: oac.originAccessControlId,
 *     },
 *   ],
 *   defaultCacheBehavior: {
 *     targetOriginId: "site",
 *     viewerProtocolPolicy: "redirect-to-https",
 *     compress: true,
 *   },
 *   viewerCertificate: {
 *     acmCertificateArn: certificate.certificateArn,
 *     sslSupportMethod: "sni-only",
 *     minimumProtocolVersion: "TLSv1.2_2021",
 *   },
 * });
 * ```
 *
 * ### Invalidating the Cache
 * **Example:** Purge Paths on Deploy
 * ```typescript
 * // declaratively, whenever `version` changes:
 * yield* AWS.CloudFront.Invalidation("PurgeBlog", {
 *   distributionId: distribution.distributionId,
 *   paths: ["/blog/*"],
 *   version: buildId,
 * });
 * ```
 *
 * To purge at runtime from a Lambda Function, bind
 * `CloudFront.CreateInvalidation(distribution)` instead.
 *
 * @resource
 */
export declare const Distribution: import("../../Resource.ts").ResourceClass<Distribution>;
export declare const DistributionProvider: () => import("effect/Layer").Layer<Provider.Provider<Distribution>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | HttpClient.HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
/**
 * Completes a desired `DistributionConfig` with the freshly observed live
 * config before an `updateDistribution` call.
 *
 * CloudFront's `UpdateDistribution` replaces the ENTIRE distribution config:
 * any member missing from the request is rejected with `IllegalUpdate`
 * (observed in practice: "Default root object is missing for the resource",
 * "The 'OriginCustomHeaders' field is missing"). `toConfig` emits only the
 * members the props express, so updating a live distribution fails on every
 * member the props don't model — some of which (e.g. per-origin
 * `CustomHeaders`, per-behavior `TrustedSigners`) are nested inside
 * collections and not expressible as props at all.
 *
 * The standard CloudFront update pattern is read-modify-write, which the
 * delete path here already uses (`{ ...current.config, Enabled: false }`).
 * This applies the same idea to updates: desired values always win — the
 * declared props still fully control drift — and only `undefined` members
 * are carried over from the observed config. `Origins` and `CacheBehaviors`
 * items are additionally merged by identity (`Id` / `PathPattern`) so their
 * nested unexpressed members carry over too.
 *
 * Exported for unit tests.
 */
export declare const mergeWithObservedConfig: (desired: cloudfront.DistributionConfig, observed: cloudfront.DistributionConfig) => cloudfront.DistributionConfig;
//# sourceMappingURL=Distribution.d.ts.map