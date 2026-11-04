import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * A data-event resource selection inside a basic event selector. Mirrors the
 * CloudTrail `DataResource` wire shape.
 */
export interface TrailDataResource {
    /** The resource type, e.g. `AWS::S3::Object` or `AWS::Lambda::Function`. */
    type: string;
    /** ARNs (or ARN prefixes) of the resources to log data events for. */
    values?: string[];
}
/**
 * A basic event selector controlling which management/data events the trail
 * logs. Mirrors the CloudTrail `EventSelector` wire shape.
 */
export interface TrailEventSelector {
    /**
     * Whether to log read-only events, write-only events, or all.
     * @default "All"
     */
    readWriteType?: "ReadOnly" | "WriteOnly" | "All";
    /**
     * Whether the selector includes management events.
     * @default true
     */
    includeManagementEvents?: boolean;
    /** Data-event resources to log (S3 objects, Lambda functions, …). */
    dataResources?: TrailDataResource[];
    /**
     * Management event sources to exclude (`kms.amazonaws.com`,
     * `rdsdata.amazonaws.com`).
     */
    excludeManagementEventSources?: string[];
}
/**
 * A field selector inside an advanced event selector. Mirrors the CloudTrail
 * `AdvancedFieldSelector` wire shape.
 */
export interface TrailFieldSelector {
    /**
     * The event record field to select on (e.g. `eventCategory`,
     * `resources.type`).
     */
    field: string;
    /** Exact-match values. */
    equals?: string[];
    /** Prefix-match values. */
    startsWith?: string[];
    /** Suffix-match values. */
    endsWith?: string[];
    /** Exact-mismatch values. */
    notEquals?: string[];
    /** Prefix-mismatch values. */
    notStartsWith?: string[];
    /** Suffix-mismatch values. */
    notEndsWith?: string[];
}
/**
 * An advanced event selector controlling which events the trail logs.
 * Advanced and basic event selectors are mutually exclusive.
 */
export interface TrailAdvancedEventSelector {
    /** Descriptive name for the selector. */
    name?: string;
    /** Field selectors that events must match to be logged. */
    fieldSelectors: TrailFieldSelector[];
}
/**
 * An Insights selector enabling anomaly detection on the trail's events.
 */
export interface TrailInsightSelector {
    /** The type of Insights to enable. */
    insightType: "ApiCallRateInsight" | "ApiErrorRateInsight";
}
export interface TrailProps {
    /**
     * Name of the trail. Must be 3-128 characters, contain only letters,
     * numbers, periods, underscores, and dashes, and start and end with a
     * letter or number.
     * @default ${app}-${stage}-${id}
     */
    trailName?: string;
    /**
     * Name of the Amazon S3 bucket designated for publishing log files.
     * The bucket policy must grant `cloudtrail.amazonaws.com` the
     * `s3:GetBucketAcl` and `s3:PutObject` permissions, scoped with an
     * `aws:SourceArn` condition on the trail's ARN.
     */
    s3BucketName: string;
    /**
     * Amazon S3 key prefix that follows the name of the bucket designated
     * for log file delivery.
     */
    s3KeyPrefix?: string;
    /**
     * Whether the trail publishes events from global services such as IAM
     * to the log files.
     * @default true
     */
    includeGlobalServiceEvents?: boolean;
    /**
     * Whether the trail applies to all Regions or only the Region in which
     * it was created.
     * @default false
     */
    isMultiRegionTrail?: boolean;
    /**
     * Whether log file validation (SHA-256 digest files) is enabled.
     * @default false
     */
    enableLogFileValidation?: boolean;
    /**
     * ARN of the CloudWatch Logs log group to which CloudTrail delivers
     * events. Requires `cloudWatchLogsRoleArn`.
     */
    cloudWatchLogsLogGroupArn?: string;
    /**
     * Role ARN that CloudTrail assumes to write to the CloudWatch Logs
     * log group. Requires `cloudWatchLogsLogGroupArn`.
     */
    cloudWatchLogsRoleArn?: string;
    /**
     * KMS key ID (ID, alias, or ARN) used to encrypt the log files
     * delivered by CloudTrail. Compared verbatim against the observed
     * trail's key, so prefer the full key ARN to avoid a perpetual diff.
     */
    kmsKeyId?: string;
    /**
     * Name of the Amazon SNS topic notified of new log file delivery.
     */
    snsTopicName?: string;
    /**
     * Whether the trail is created for all accounts in an organization,
     * or only for the current account.
     * @default false
     */
    isOrganizationTrail?: boolean;
    /**
     * Whether the trail is actively logging. Synced via `StartLogging` /
     * `StopLogging`.
     * @default true
     */
    isLogging?: boolean;
    /**
     * Basic event selectors, synced via `PutEventSelectors`. Mutually
     * exclusive with `advancedEventSelectors`. When omitted, the trail's
     * selectors are left untouched; pass `[]`-free defaults explicitly to
     * converge them.
     */
    eventSelectors?: TrailEventSelector[];
    /**
     * Advanced event selectors, synced via `PutEventSelectors`. Mutually
     * exclusive with `eventSelectors`. When omitted, the trail's selectors
     * are left untouched.
     */
    advancedEventSelectors?: TrailAdvancedEventSelector[];
    /**
     * Insights selectors, synced via `PutInsightSelectors`. Pass `[]` to
     * disable Insights; when omitted, the trail's Insights configuration is
     * left untouched.
     */
    insightSelectors?: TrailInsightSelector[];
    /**
     * Tags to apply to the trail. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Trail extends Resource<"AWS.CloudTrail.Trail", TrailProps, {
    /** Physical name of the trail. */
    trailName: string;
    /** ARN of the trail. */
    trailArn: string;
    /** The region in which the trail was created. */
    homeRegion: string;
    /** S3 bucket the trail delivers log files to. */
    s3BucketName: string;
    /** Whether the trail is currently logging. */
    isLogging: boolean;
}, never, Providers> {
}
/**
 * An AWS CloudTrail trail that records AWS API activity and delivers log
 * files to an S3 bucket.
 *
 * The destination bucket must carry a bucket policy that allows the
 * `cloudtrail.amazonaws.com` service principal to call `s3:GetBucketAcl`
 * on the bucket and `s3:PutObject` under `AWSLogs/{accountId}/*`, both
 * scoped with an `aws:SourceArn` condition on the trail's ARN.
 * ### Creating Trails
 * **Example:** Basic Trail
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const bucket = yield* AWS.S3.Bucket("TrailLogs", {
 *   bucketName: `audit-logs-${accountId}`,
 *   forceDestroy: true,
 *   policy: [
 *     {
 *       Effect: "Allow",
 *       Principal: { Service: "cloudtrail.amazonaws.com" },
 *       Action: ["s3:GetBucketAcl"],
 *       Resource: `arn:aws:s3:::audit-logs-${accountId}`,
 *       Condition: { StringEquals: { "aws:SourceArn": trailArn } },
 *     },
 *     {
 *       Effect: "Allow",
 *       Principal: { Service: "cloudtrail.amazonaws.com" },
 *       Action: ["s3:PutObject"],
 *       Resource: `arn:aws:s3:::audit-logs-${accountId}/AWSLogs/${accountId}/*`,
 *       Condition: {
 *         StringEquals: {
 *           "s3:x-amz-acl": "bucket-owner-full-control",
 *           "aws:SourceArn": trailArn,
 *         },
 *       },
 *     },
 *   ],
 * });
 *
 * const trail = yield* AWS.CloudTrail.Trail("Audit", {
 *   trailName: "audit-trail",
 *   s3BucketName: bucket.bucketName,
 * });
 * ```
 *
 * **Example:** Multi-Region Trail with Log File Validation
 * ```typescript
 * const trail = yield* AWS.CloudTrail.Trail("Audit", {
 *   trailName: "org-audit-trail",
 *   s3BucketName: bucket.bucketName,
 *   isMultiRegionTrail: true,
 *   enableLogFileValidation: true,
 * });
 * ```
 *
 * ### Controlling Logging
 * **Example:** Pause logging without deleting the trail
 * ```typescript
 * const trail = yield* AWS.CloudTrail.Trail("Audit", {
 *   trailName: "audit-trail",
 *   s3BucketName: bucket.bucketName,
 *   isLogging: false,
 * });
 * ```
 *
 * ### Selecting Events
 * **Example:** Advanced Event Selectors and Insights
 * ```typescript
 * const trail = yield* AWS.CloudTrail.Trail("Audit", {
 *   trailName: "audit-trail",
 *   s3BucketName: bucket.bucketName,
 *   advancedEventSelectors: [
 *     {
 *       name: "Management events only",
 *       fieldSelectors: [
 *         { field: "eventCategory", equals: ["Management"] },
 *       ],
 *     },
 *   ],
 *   insightSelectors: [{ insightType: "ApiCallRateInsight" }],
 * });
 * ```
 *
 * @resource
 */
export declare const Trail: import("../../Resource.ts").ResourceClass<Trail>;
export declare const TrailProvider: () => import("effect/Layer").Layer<Provider.Provider<Trail>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Trail.d.ts.map