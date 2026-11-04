import * as cloudfront from "@distilled.cloud/aws/cloudfront";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface VpcOriginProps {
    /**
     * Name of the VPC origin. If omitted, a deterministic name is generated.
     */
    name?: string;
    /**
     * ARN of the resource the VPC origin fronts (an Application/Network Load
     * Balancer or an EC2 instance in a VPC). Changing the target ARN forces a
     * replacement.
     */
    arn: string;
    /**
     * HTTP port CloudFront uses to connect to the origin.
     * @default 80
     */
    httpPort?: number;
    /**
     * HTTPS port CloudFront uses to connect to the origin.
     * @default 443
     */
    httpsPort?: number;
    /**
     * Origin protocol policy CloudFront uses to connect to the origin.
     * @default "https-only"
     */
    originProtocolPolicy?: cloudfront.OriginProtocolPolicy;
    /**
     * SSL/TLS protocols CloudFront uses when establishing an HTTPS connection.
     * @default ["TLSv1.2"]
     */
    originSslProtocols?: cloudfront.SslProtocol[];
    /**
     * User-defined tags to apply to the VPC origin.
     */
    tags?: Record<string, string>;
}
export interface VpcOrigin extends Resource<"AWS.CloudFront.VpcOrigin", VpcOriginProps, {
    /**
     * CloudFront-assigned VPC origin identifier.
     */
    vpcOriginId: string;
    /**
     * ARN of the VPC origin.
     */
    vpcOriginArn: string;
    /**
     * Current deployment status of the VPC origin.
     */
    status: string;
    /**
     * Name of the VPC origin.
     */
    name: string;
    /**
     * ARN of the resource the VPC origin fronts.
     */
    arn: string;
    /**
     * Creation timestamp.
     */
    createdTime: Date | undefined;
    /**
     * Last CloudFront modification timestamp.
     */
    lastModifiedTime: Date | undefined;
    /**
     * Most recent entity tag for update/delete operations.
     */
    etag: string | undefined;
    /**
     * Current tags on the VPC origin.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A CloudFront VPC origin.
 *
 * `VpcOrigin` lets a CloudFront distribution route to a private Application
 * Load Balancer, Network Load Balancer, or EC2 instance inside a VPC without
 * exposing it to the public internet. Reference the resulting `vpcOriginId`
 * from a distribution origin's `vpcOriginConfig`.
 * ### Creating VPC Origins
 * **Example:** Private ALB Origin
 * ```typescript
 * const vpcOrigin = yield* VpcOrigin("AppOrigin", {
 *   arn: loadBalancer.arn,
 *   httpPort: 80,
 *   httpsPort: 443,
 *   originProtocolPolicy: "https-only",
 * });
 * ```
 *
 * **Example:** Attaching a VPC Origin to a Distribution
 * ```typescript
 * const distribution = yield* Distribution("AppCdn", {
 *   origins: [
 *     {
 *       id: "app",
 *       domainName: loadBalancer.dnsName,
 *       vpcOriginConfig: { vpcOriginId: vpcOrigin.vpcOriginId },
 *     },
 *   ],
 *   defaultCacheBehavior: {
 *     targetOriginId: "app",
 *     viewerProtocolPolicy: "redirect-to-https",
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const VpcOrigin: import("../../Resource.ts").ResourceClass<VpcOrigin>;
export declare const VpcOriginProvider: () => import("effect/Layer").Layer<Provider.Provider<VpcOrigin>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=VpcOrigin.d.ts.map