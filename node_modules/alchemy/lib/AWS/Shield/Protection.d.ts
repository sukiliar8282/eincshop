import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * How Shield Advanced responds automatically to application-layer (layer 7)
 * DDoS attacks against the protected resource: `BLOCK` the attacking traffic
 * with the associated AWS WAF web ACL, or `COUNT` it for visibility only.
 */
export type ApplicationLayerAutomaticResponseAction = "BLOCK" | "COUNT";
export interface ProtectionProps {
    /**
     * Friendly name for the protection. Immutable — changing it replaces the
     * protection. If omitted, a unique name is generated.
     */
    name?: string;
    /**
     * ARN of the resource to protect (CloudFront distribution, Route 53 hosted
     * zone, Global Accelerator, ALB, CLB, or Elastic IP allocation). Immutable —
     * changing it replaces the protection.
     */
    resourceArn: string;
    /**
     * Route 53 health check ARNs to associate with the protection for
     * health-based DDoS detection. Mutable.
     */
    healthCheckArns?: string[];
    /**
     * Shield Advanced automatic application-layer DDoS mitigation: `BLOCK`
     * attacking traffic with the associated AWS WAF web ACL, or `COUNT` it for
     * visibility only. Omit to leave the feature disabled. Only supported for
     * CloudFront distributions and Application Load Balancers that have an
     * associated web ACL. Mutable.
     */
    applicationLayerAutomaticResponse?: ApplicationLayerAutomaticResponseAction;
    /**
     * User-defined tags. Alchemy ownership tags are merged in automatically.
     */
    tags?: Record<string, string>;
}
export interface Protection extends Resource<"AWS.Shield.Protection", ProtectionProps, {
    /** Unique identifier of the protection. */
    protectionId: string;
    /** ARN of the protection. */
    protectionArn: string;
    /** Name of the protection. */
    name: string;
    /** ARN of the protected resource. */
    resourceArn: string;
    /** IDs of the associated Route 53 health checks. */
    healthCheckIds: string[];
    /**
     * The automatic application-layer DDoS mitigation action, or `undefined`
     * when the feature is disabled.
     */
    applicationLayerAutomaticResponse: ApplicationLayerAutomaticResponseAction | undefined;
    /** Tags on the protection (including Alchemy ownership tags). */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS Shield Advanced Protection for a single resource (CloudFront
 * distribution, Route 53 hosted zone, Global Accelerator, Application/Classic
 * Load Balancer, or Elastic IP).
 *
 * Requires an active Shield Advanced subscription ($3,000/month with a 1-year
 * commitment); without one every call fails with the typed
 * `SubscriptionNotFound` error.
 *
 * ### Protecting Resources
 * **Example:** Protect a CloudFront Distribution
 * ```typescript
 * const protection = yield* Shield.Protection("SiteProtection", {
 *   resourceArn: distribution.distributionArn,
 * });
 * ```
 *
 * **Example:** Protection with Health-Based Detection
 * ```typescript
 * const protection = yield* Shield.Protection("ApiProtection", {
 *   name: "api-protection",
 *   resourceArn: loadBalancer.loadBalancerArn,
 *   healthCheckArns: ["arn:aws:route53:::healthcheck/11111111-2222-3333-4444-555555555555"],
 *   tags: { team: "platform" },
 * });
 * ```
 *
 * ### Automatic Application-Layer Mitigation
 * **Example:** Block Layer-7 Attacks Automatically
 * ```typescript
 * // Requires an AWS WAF web ACL associated with the CloudFront distribution
 * // or Application Load Balancer.
 * const protection = yield* Shield.Protection("SiteProtection", {
 *   resourceArn: distribution.distributionArn,
 *   applicationLayerAutomaticResponse: "BLOCK",
 * });
 * ```
 */
export declare const Protection: import("../../Resource.ts").ResourceClass<Protection>;
export declare const ProtectionProvider: () => import("effect/Layer").Layer<Provider.Provider<Protection>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Protection.d.ts.map