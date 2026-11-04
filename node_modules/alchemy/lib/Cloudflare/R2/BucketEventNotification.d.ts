import * as r2 from "@distilled.cloud/cloudflare/r2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
import type { Bucket } from "./Bucket.ts";
declare const TypeId: "Cloudflare.R2.BucketEventNotification";
type TypeId = typeof TypeId;
/**
 * An R2 object action that can trigger an event notification.
 *
 * - `PutObject` — an object is uploaded via a single PUT
 * - `CopyObject` — an object is copied into the bucket
 * - `DeleteObject` — an object is deleted
 * - `CompleteMultipartUpload` — a multipart upload completes
 * - `LifecycleDeletion` — an object is deleted by a lifecycle rule
 */
export type BucketEventNotificationAction = "PutObject" | "CopyObject" | "DeleteObject" | "CompleteMultipartUpload" | "LifecycleDeletion";
/**
 * A single notification rule. An event message is delivered to the queue
 * when an object matching the rule's `prefix`/`suffix` undergoes one of
 * the rule's `actions`.
 */
export interface BucketEventNotificationRule {
    /**
     * Object actions that trigger a notification for this rule.
     */
    actions: BucketEventNotificationAction[];
    /**
     * Only notify for objects whose key starts with this prefix.
     * @default "" (match all objects)
     */
    prefix?: string;
    /**
     * Only notify for objects whose key ends with this suffix.
     * @default "" (match all objects)
     */
    suffix?: string;
    /**
     * Human-readable description of the rule. Cloudflare auto-generates one
     * when omitted.
     */
    description?: string;
}
export interface BucketEventNotificationProps {
    /**
     * Name of the R2 bucket that produces the events. Pass
     * `bucket.bucketName` from a `Cloudflare.R2.Bucket`.
     *
     * Immutable — changing the bucket triggers a replacement.
     */
    bucketName: string;
    /**
     * ID of the Queue that receives the event messages. Pass
     * `queue.queueId` from a `Cloudflare.Queues.Queue`.
     *
     * Immutable — changing the queue triggers a replacement.
     */
    queueId: string;
    /**
     * Jurisdiction of the bucket (must match the bucket's own jurisdiction).
     *
     * Immutable — changing the jurisdiction triggers a replacement.
     * @default "default"
     */
    jurisdiction?: Bucket.Jurisdiction;
    /**
     * Rules that decide which object events are delivered to the queue.
     * The full set is replaced on every update (the provider clears the
     * pair's configuration and re-creates the desired rules when they
     * drift).
     *
     * Note: Cloudflare rejects rule sets whose `prefix`/`suffix` key ranges
     * overlap ("invalid overlap"), even when their actions are disjoint —
     * scope each rule to a distinct key range.
     */
    rules: BucketEventNotificationRule[];
}
export interface BucketEventNotificationAttributes {
    /** Name of the bucket that produces the events. */
    bucketName: string;
    /** ID of the queue that receives the event messages. */
    queueId: string;
    /** Name of the queue that receives the event messages, if reported. */
    queueName: string | undefined;
    /** Account the configuration lives in. */
    accountId: string;
    /** Jurisdiction of the bucket. */
    jurisdiction: Bucket.Jurisdiction;
    /** The active notification rules, including server-assigned rule IDs. */
    rules: BucketEventNotification.Rule[];
}
export type BucketEventNotification = Resource<TypeId, BucketEventNotificationProps, BucketEventNotificationAttributes, never, Providers>;
/**
 * Event notifications for a Cloudflare R2 bucket, delivered to a Queue.
 *
 * When objects in the bucket are created, deleted, or copied, R2 publishes
 * an event message to the configured Queue. One configuration exists per
 * (bucket, queue) pair and holds a list of rules; consume the messages with
 * a Queue consumer Worker.
 *
 * The configuration's identity is the (bucket, queue) pair — changing
 * either triggers a replacement, while rule changes are applied in place
 * (the provider converges the pair's configuration to exactly the
 * declared rule set).
 * ### Notifying a Queue
 * **Example:** Notify on every upload and delete
 * ```typescript
 * const bucket = yield* Cloudflare.R2.Bucket("Uploads");
 * const queue = yield* Cloudflare.Queues.Queue("UploadEvents");
 *
 * yield* Cloudflare.R2.BucketEventNotification("UploadNotifications", {
 *   bucketName: bucket.bucketName,
 *   queueId: queue.queueId,
 *   rules: [
 *     {
 *       actions: ["PutObject", "CompleteMultipartUpload", "DeleteObject"],
 *     },
 *   ],
 * });
 * ```
 *
 * **Example:** Scope notifications to a key prefix and suffix
 * ```typescript
 * yield* Cloudflare.R2.BucketEventNotification("ImageNotifications", {
 *   bucketName: bucket.bucketName,
 *   queueId: queue.queueId,
 *   rules: [
 *     {
 *       actions: ["PutObject"],
 *       prefix: "images/",
 *       suffix: ".png",
 *       description: "new PNG images",
 *     },
 *   ],
 * });
 * ```
 *
 * ### Multiple rules
 * **Example:** Separate rules per key range
 * ```typescript
 * // Rules must cover non-overlapping key ranges — Cloudflare rejects
 * // overlapping prefixes/suffixes even when the actions are disjoint.
 * yield* Cloudflare.R2.BucketEventNotification("Notifications", {
 *   bucketName: bucket.bucketName,
 *   queueId: queue.queueId,
 *   rules: [
 *     { actions: ["PutObject"], prefix: "incoming/" },
 *     { actions: ["DeleteObject", "LifecycleDeletion"], prefix: "logs/" },
 *   ],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/r2/buckets/event-notifications/
 *
 * @resource
 * @product R2
 * @category Storage & Databases
 */
export declare const BucketEventNotification: import("../../Resource.ts").ResourceClass<BucketEventNotification>;
export declare namespace BucketEventNotification {
    type Rule = {
        actions: BucketEventNotificationAction[];
        prefix: string;
        suffix: string;
        description: string | undefined;
        ruleId: string | undefined;
        createdAt: string | undefined;
    };
}
/**
 * Returns true if the given value is an BucketEventNotification resource.
 */
export declare const isBucketEventNotification: (value: unknown) => value is BucketEventNotification;
export declare const BucketEventNotificationProvider: () => import("effect/Layer").Layer<Provider.Provider<BucketEventNotification>, never, CloudflareEnvironment | r2.CloudflareOpContext>;
export {};
//# sourceMappingURL=BucketEventNotification.d.ts.map