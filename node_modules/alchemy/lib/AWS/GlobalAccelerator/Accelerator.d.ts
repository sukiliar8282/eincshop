import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface AcceleratorProps {
    /**
     * Name of the accelerator. Up to 64 characters; letters, digits, and
     * hyphens only, and must not begin or end with a hyphen.
     * @default ${app}-${id}-${stage}-${suffix}
     */
    name?: string;
    /**
     * The IP address type that the accelerator's static addresses use.
     * `DUAL_STACK` assigns both IPv4 and IPv6 addresses.
     * @default "IPV4"
     */
    ipAddressType?: "IPV4" | "DUAL_STACK";
    /**
     * Optionally specify one or two static IPv4 addresses from your own
     * BYOIP address pools. Changing them replaces the accelerator.
     * @default addresses assigned from Amazon's pool
     */
    ipAddresses?: string[];
    /**
     * Whether the accelerator accepts and routes traffic. A disabled
     * accelerator keeps its static IP addresses but serves nothing.
     * @default true
     */
    enabled?: boolean;
    /**
     * Publish flow logs describing the traffic the accelerator serves to an
     * S3 bucket. The bucket must live in the same account and carry a bucket
     * policy granting `delivery.logs.amazonaws.com` permission to
     * `s3:PutObject` (and `s3:GetBucketAcl`). Omit to keep flow logs
     * disabled.
     * @default disabled
     */
    flowLogs?: FlowLogs;
    /**
     * Tags to apply to the accelerator. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface FlowLogs {
    /**
     * Name of the S3 bucket flow logs are delivered to.
     */
    bucket: string;
    /**
     * Key prefix for the flow-log objects within the bucket.
     * @default logs are delivered under `AWSLogs/` at the bucket root
     */
    prefix?: string;
}
export interface Accelerator extends Resource<"AWS.GlobalAccelerator.Accelerator", AcceleratorProps, {
    /** The ARN of the accelerator. */
    acceleratorArn: string;
    /** The name of the accelerator. */
    name: string;
    /** The DNS name that points to the accelerator's static IPv4 addresses. */
    dnsName: string | undefined;
    /** The DNS name for dual-stack (IPv4 + IPv6) accelerators. */
    dualStackDnsName: string | undefined;
    /** The static anycast IP addresses assigned to the accelerator. */
    ipAddresses: string[];
    /** The IP address type: `IPV4` or `DUAL_STACK`. */
    ipAddressType: string;
    /** Whether the accelerator accepts and routes traffic. */
    enabled: boolean;
    /** Deployment status: `DEPLOYED` or `IN_PROGRESS`. */
    status: string;
    /** Whether flow logs are published to S3. */
    flowLogsEnabled: boolean;
    /** The S3 bucket receiving flow logs, when enabled. */
    flowLogsS3Bucket: string | undefined;
    /** The S3 key prefix for flow logs, when enabled. */
    flowLogsS3Prefix: string | undefined;
}, never, Providers> {
}
/**
 * An AWS Global Accelerator standard accelerator — two anycast static IP
 * addresses that route client traffic over the AWS global network to the
 * closest healthy regional endpoint.
 *
 * Accelerators are global resources (the control-plane API lives in
 * us-west-2 regardless of your deployment region — alchemy pins it
 * automatically). Attach `Listener`s to accept traffic and `EndpointGroup`s
 * to route it to ALBs, NLBs, EC2 instances, or Elastic IPs per region.
 * ### Creating Accelerators
 * **Example:** Basic Accelerator
 * ```typescript
 * import * as GlobalAccelerator from "alchemy/AWS/GlobalAccelerator";
 *
 * const accelerator = yield* GlobalAccelerator.Accelerator("Edge");
 * ```
 *
 * **Example:** Dual-Stack Accelerator
 * ```typescript
 * const accelerator = yield* GlobalAccelerator.Accelerator("Edge", {
 *   ipAddressType: "DUAL_STACK",
 * });
 * ```
 *
 * ### Flow Logs
 * **Example:** Publish Flow Logs to S3
 * ```typescript
 * // the bucket policy must grant delivery.logs.amazonaws.com
 * // s3:PutObject + s3:GetBucketAcl
 * const accelerator = yield* GlobalAccelerator.Accelerator("Edge", {
 *   flowLogs: { bucket: logBucket.bucketName, prefix: "ga-flow-logs" },
 * });
 * ```
 *
 * ### Routing Traffic
 * **Example:** Accelerator with Listener and Endpoint Group
 * ```typescript
 * const accelerator = yield* GlobalAccelerator.Accelerator("Edge");
 * const listener = yield* GlobalAccelerator.Listener("Web", {
 *   acceleratorArn: accelerator.acceleratorArn,
 *   portRanges: [{ fromPort: 443, toPort: 443 }],
 *   protocol: "TCP",
 * });
 * yield* GlobalAccelerator.EndpointGroup("UsWest2", {
 *   listenerArn: listener.listenerArn,
 *   endpointGroupRegion: "us-west-2",
 *   endpoints: [{ endpointId: alb.loadBalancerArn }],
 * });
 * ```
 *
 * @resource
 */
export declare const Accelerator: import("../../Resource.ts").ResourceClass<Accelerator>;
export declare const AcceleratorProvider: () => import("effect/Layer").Layer<Provider.Provider<Accelerator>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Accelerator.d.ts.map