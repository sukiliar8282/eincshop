import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * Server-side encryption for auto-exported revisions.
 */
export interface EventActionEncryption {
    /**
     * The encryption type: `aws:kms` (with `kmsKeyArn`) or `AES256`.
     */
    type: "aws:kms" | "AES256";
    /**
     * The ARN of the KMS key used to encrypt exported objects when `type` is
     * `aws:kms`.
     */
    kmsKeyArn?: string;
}
/**
 * The auto-export destination of an event action.
 */
export interface EventActionExportRevisionToS3 {
    /**
     * The S3 bucket auto-exported revisions are written to. The bucket policy
     * must allow the AWS Data Exchange service principal to write to it.
     */
    bucket: string;
    /**
     * Pattern for naming exported objects, built from `${Revision.CreatedAt}`
     * and `${Asset.Name}` variables.
     * @default "${Asset.Name}"
     */
    keyPattern?: string;
    /**
     * Server-side encryption applied to exported objects.
     */
    encryption?: EventActionEncryption;
}
export interface EventActionProps {
    /**
     * The id of the ENTITLED data set whose `RevisionPublished` event triggers
     * the action. Event actions can only be created for entitled data sets
     * (subscriptions or accepted data grants), not for owned data sets.
     * Immutable — changing it replaces the event action.
     */
    dataSetId: string;
    /**
     * Where to auto-export newly published revisions. Mutable in place.
     */
    exportRevisionToS3: EventActionExportRevisionToS3;
    /**
     * Tags to apply to the event action. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface EventAction extends Resource<"AWS.DataExchange.EventAction", EventActionProps, {
    /**
     * The unique identifier of the event action.
     */
    eventActionId: string;
    /**
     * The ARN of the event action.
     */
    eventActionArn: string;
    /**
     * The id of the entitled data set the event action watches.
     */
    dataSetId: string;
}, never, Providers> {
}
/**
 * An AWS Data Exchange event action — an auto-export rule that copies every
 * newly published revision of an ENTITLED data set into your S3 bucket the
 * moment the provider publishes it. This is the subscriber-side automation
 * primitive: subscribe to a product (or accept a data grant), attach an
 * event action, and fresh data lands in your bucket with no polling.
 *
 * Event actions require an entitled data set — creating one against an
 * owned data set fails with a `ValidationException`.
 *
 * ### Auto-Exporting Entitled Data
 * **Example:** Export new revisions to S3
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const landing = yield* AWS.S3.Bucket("Landing", {});
 *
 * const autoExport = yield* AWS.DataExchange.EventAction("AutoExport", {
 *   dataSetId: entitledDataSetId,
 *   exportRevisionToS3: { bucket: landing.bucketName },
 * });
 * ```
 *
 * **Example:** Encrypted export with a key pattern
 * ```typescript
 * const autoExport = yield* AWS.DataExchange.EventAction("AutoExport", {
 *   dataSetId: entitledDataSetId,
 *   exportRevisionToS3: {
 *     bucket: landing.bucketName,
 *     keyPattern: "prices/${Revision.CreatedAt}/${Asset.Name}",
 *     encryption: { type: "aws:kms", kmsKeyArn: key.keyArn },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const EventAction: import("../../Resource.ts").ResourceClass<EventAction>;
export declare const EventActionProvider: () => import("effect/Layer").Layer<Provider.Provider<EventAction>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=EventAction.d.ts.map