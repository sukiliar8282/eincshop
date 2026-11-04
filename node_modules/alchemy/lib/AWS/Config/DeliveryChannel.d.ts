import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface DeliveryChannelProps {
    /**
     * Name of the delivery channel. AWS allows only ONE delivery channel per
     * account per region. Changing the name replaces the channel.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Name of the S3 bucket AWS Config delivers configuration snapshots and
     * history files to. The bucket needs a policy granting
     * `config.amazonaws.com` `s3:GetBucketAcl` on the bucket and
     * `s3:PutObject` on `arn:aws:s3:::{bucket}/AWSLogs/{account}/Config/*`.
     */
    s3BucketName: string;
    /**
     * Key prefix for the delivered objects.
     */
    s3KeyPrefix?: string;
    /**
     * ARN of the KMS key AWS Config uses to encrypt objects delivered to the
     * S3 bucket.
     */
    s3KmsKeyArn?: string;
    /**
     * ARN of the SNS topic AWS Config sends notifications to.
     */
    snsTopicArn?: string;
    /**
     * How often AWS Config delivers configuration snapshots to the bucket.
     */
    snapshotDeliveryFrequency?: "One_Hour" | "Three_Hours" | "Six_Hours" | "Twelve_Hours" | "TwentyFour_Hours";
}
export interface DeliveryChannel extends Resource<"AWS.Config.DeliveryChannel", DeliveryChannelProps, {
    /** Physical name of the delivery channel. */
    deliveryChannelName: string;
    /** S3 bucket configuration snapshots and history are delivered to. */
    s3BucketName: string;
}, never, Providers> {
}
/**
 * The AWS Config delivery channel that delivers configuration snapshots and
 * configuration history to an S3 bucket (and optionally notifies an SNS
 * topic).
 *
 * AWS allows only **one** delivery channel per account per region — treat
 * this resource as an account-region singleton. A configuration recorder
 * must exist before the channel can be created (see
 * `AWS.Config.ConfigurationRecorder`).
 * ### Creating the Channel
 * **Example:** Deliver configuration history to S3
 * ```typescript
 * import * as Config from "alchemy/AWS/Config";
 *
 * const channel = yield* Config.DeliveryChannel("Channel", {
 *   s3BucketName: bucket.bucketName,
 * });
 * ```
 *
 * **Example:** Periodic snapshots with a key prefix
 * ```typescript
 * const channel = yield* Config.DeliveryChannel("Channel", {
 *   s3BucketName: bucket.bucketName,
 *   s3KeyPrefix: "config",
 *   snapshotDeliveryFrequency: "TwentyFour_Hours",
 * });
 * ```
 *
 * @resource
 */
export declare const DeliveryChannel: import("../../Resource.ts").ResourceClass<DeliveryChannel>;
export declare const DeliveryChannelProvider: () => import("effect/Layer").Layer<Provider.Provider<DeliveryChannel>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DeliveryChannel.d.ts.map