import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment, type AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type { ArchiveState } from "@distilled.cloud/aws/eventbridge";
export type ArchiveName = string;
export type ArchiveArn = `arn:aws:events:${RegionID}:${AccountID}:archive/${ArchiveName}`;
export interface ArchiveProps {
    /**
     * Name of the archive. Must match [\.\-_A-Za-z0-9]+, 1-48 characters.
     * If omitted, a unique name will be generated.
     */
    name?: ArchiveName;
    /**
     * ARN of the event bus whose events are archived. Immutable — changing it
     * replaces the archive.
     */
    eventSourceArn: string;
    /**
     * Description of the archive. Max 512 characters.
     */
    description?: string;
    /**
     * Event pattern filtering which events are archived, as a JSON-compatible
     * object. If omitted, all events on the source bus are archived (except
     * replayed events).
     */
    eventPattern?: Record<string, any>;
    /**
     * How long events are retained in the archive, as any `Duration.Input`
     * (e.g. `"30 days"`, `Duration.days(90)`); converted to whole days on the
     * wire (`RetentionDays`).
     * @default indefinite retention
     */
    retention?: Duration.Input;
    /**
     * The identifier of the KMS customer managed key to encrypt events in this
     * archive. Strongly recommended when the source event bus uses a customer
     * managed key.
     */
    kmsKeyIdentifier?: string;
}
/**
 * An Amazon EventBridge archive that retains events from an event bus so
 * they can later be replayed (see the replay bindings: `StartReplay`,
 * `DescribeReplay`, `CancelReplay`, `ListReplays`).
 *
 * Archives do not support tags, so ownership is tracked by the
 * deterministic physical name.
 * ### Archiving Events
 * **Example:** Archive All Events on a Bus
 * ```typescript
 * const bus = yield* AWS.EventBridge.EventBus("AppEvents", {});
 *
 * const archive = yield* AWS.EventBridge.Archive("AppArchive", {
 *   eventSourceArn: bus.eventBusArn,
 *   retention: "30 days",
 * });
 * ```
 *
 * **Example:** Archive a Filtered Subset of Events
 * ```typescript
 * const archive = yield* AWS.EventBridge.Archive("OrderArchive", {
 *   eventSourceArn: bus.eventBusArn,
 *   description: "Order events only",
 *   eventPattern: { source: ["my.app"], "detail-type": ["OrderCreated"] },
 *   retention: "90 days",
 * });
 * ```
 *
 * @resource
 */
export interface Archive extends Resource<"AWS.EventBridge.Archive", ArchiveProps, {
    /** The name of the archive. */
    archiveName: ArchiveName;
    /** The ARN of the archive. */
    archiveArn: ArchiveArn;
    /** The ARN of the event bus the archive sources events from. */
    eventSourceArn: string;
}, never, Providers> {
}
export declare const Archive: import("../../Resource.ts").ResourceClass<Archive>;
export declare const ArchiveProvider: () => import("effect/Layer").Layer<Provider.Provider<Archive>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Archive.d.ts.map