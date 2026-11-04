import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * Which traffic a service-network access log subscription captures.
 */
export type ServiceNetworkLogType = "SERVICE" | "RESOURCE";
export interface AccessLogSubscriptionProps {
    /**
     * ID or ARN of the service network or lattice service whose traffic is
     * logged. Immutable — changing it replaces the subscription.
     */
    resourceIdentifier: string;
    /**
     * ARN of the delivery destination: a CloudWatch log group, Firehose
     * delivery stream, or S3 bucket. The destination can be updated in place,
     * but changing the destination *type* (e.g. CloudWatch → S3) replaces the
     * subscription.
     */
    destinationArn: string;
    /**
     * For service networks, whether to log traffic to lattice services or to
     * shared VPC resources. Immutable — changing it replaces the subscription.
     * @default "SERVICE"
     */
    serviceNetworkLogType?: ServiceNetworkLogType;
    /**
     * User-defined tags to apply to the subscription.
     */
    tags?: Record<string, string>;
}
export interface AccessLogSubscription extends Resource<"AWS.VpcLattice.AccessLogSubscription", AccessLogSubscriptionProps, {
    /**
     * Service-assigned unique ID of the subscription.
     */
    accessLogSubscriptionId: string;
    /**
     * ARN of the subscription.
     */
    accessLogSubscriptionArn: string;
    /**
     * ID of the service network or service whose traffic is logged.
     */
    resourceId: string;
    /**
     * ARN of the service network or service whose traffic is logged.
     */
    resourceArn: string;
    /**
     * ARN of the delivery destination.
     */
    destinationArn: string;
    /**
     * Current tags reported for the subscription.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon VPC Lattice access log subscription — delivers per-request
 * access logs for a service network or lattice service to CloudWatch Logs,
 * Kinesis Data Firehose, or S3.
 *
 * ### Creating Access Log Subscriptions
 * **Example:** Log a Service Network to CloudWatch
 * ```typescript
 * const logs = yield* AccessLogSubscription("NetworkLogs", {
 *   resourceIdentifier: network.serviceNetworkId,
 *   destinationArn: logGroup.logGroupArn,
 * });
 * ```
 *
 * **Example:** Log a Service to S3
 * ```typescript
 * const logs = yield* AccessLogSubscription("ServiceLogs", {
 *   resourceIdentifier: service.serviceId,
 *   destinationArn: bucket.bucketArn,
 * });
 * ```
 *
 * @resource
 */
export declare const AccessLogSubscription: import("../../Resource.ts").ResourceClass<AccessLogSubscription>;
export declare const AccessLogSubscriptionProvider: () => import("effect/Layer").Layer<Provider.Provider<AccessLogSubscription>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=AccessLogSubscription.d.ts.map