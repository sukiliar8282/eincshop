import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * A field selector inside an advanced event selector. Mirrors the
 * CloudTrail `AdvancedFieldSelector` wire shape.
 */
export interface EventDataStoreFieldSelector {
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
 * An advanced event selector controlling which events the event data
 * store collects.
 */
export interface EventDataStoreEventSelector {
    /** Descriptive name for the selector. */
    name?: string;
    /** Field selectors that events must match to be collected. */
    fieldSelectors: EventDataStoreFieldSelector[];
}
export interface EventDataStoreProps {
    /**
     * Name of the event data store. Must be 3-128 characters, contain only
     * letters, numbers, periods, underscores, and dashes, and start and end
     * with a letter or number. Renaming updates the store in place (the ARN
     * is the stable identity).
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Advanced event selectors controlling which events are collected.
     * @default management events
     */
    advancedEventSelectors?: EventDataStoreEventSelector[];
    /**
     * Whether the event data store collects events from all Regions or
     * only the current Region.
     * @default true
     */
    multiRegionEnabled?: boolean;
    /**
     * Whether the event data store collects events for all accounts in an
     * organization.
     * @default false
     */
    organizationEnabled?: boolean;
    /**
     * Retention period, e.g. `"30 days"` or `Duration.days(30)` (minimum
     * 7 days; maximum 2557 days under `EXTENDABLE_RETENTION_PRICING`,
     * 3653 days under `FIXED_RETENTION_PRICING`). Rounded to whole days
     * on the wire.
     * @default 366 days
     */
    retentionPeriod?: Duration.Input;
    /**
     * Whether termination protection is enabled. A protected store cannot
     * be deleted until protection is disabled.
     * @default true (AWS default)
     */
    terminationProtectionEnabled?: boolean;
    /**
     * The billing mode for the event data store.
     * @default "EXTENDABLE_RETENTION_PRICING"
     */
    billingMode?: "EXTENDABLE_RETENTION_PRICING" | "FIXED_RETENTION_PRICING";
    /**
     * KMS key ID (ID, alias, or ARN) used to encrypt the events delivered
     * to the event data store.
     */
    kmsKeyId?: string;
    /**
     * Whether the event data store ingests live events. Synced via
     * `StartEventDataStoreIngestion` / `StopEventDataStoreIngestion`; a
     * stopped store keeps its collected events queryable.
     * @default true (AWS default)
     */
    ingestionEnabled?: boolean;
    /**
     * Tags to apply to the event data store. Merged with internal Alchemy
     * tags.
     */
    tags?: Record<string, string>;
}
export interface EventDataStore extends Resource<"AWS.CloudTrail.EventDataStore", EventDataStoreProps, {
    /** ARN of the event data store (its stable identity). */
    eventDataStoreArn: string;
    /** Name of the event data store. */
    name: string;
    /** Current status (e.g. `ENABLED`, `STARTING_INGESTION`). */
    status: string;
}, never, Providers> {
}
/**
 * A CloudTrail Lake event data store — an immutable collection of events
 * that can be queried with SQL via CloudTrail Lake.
 *
 * Deleting an event data store schedules it for deletion
 * (`PENDING_DELETION`); AWS purges it after a seven-day wait period during
 * which it incurs no cost. If a store with the same name is still pending
 * deletion, the reconciler restores it instead of creating a duplicate.
 * ### Creating Event Data Stores
 * **Example:** Basic Event Data Store
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const store = yield* AWS.CloudTrail.EventDataStore("Lake", {
 *   retentionPeriod: "7 days",
 *   terminationProtectionEnabled: false,
 * });
 * ```
 *
 * **Example:** Single-Region Store with Custom Selectors
 * ```typescript
 * const store = yield* AWS.CloudTrail.EventDataStore("S3DataEvents", {
 *   multiRegionEnabled: false,
 *   retentionPeriod: "30 days",
 *   terminationProtectionEnabled: false,
 *   advancedEventSelectors: [
 *     {
 *       name: "S3 data events",
 *       fieldSelectors: [
 *         { field: "eventCategory", equals: ["Data"] },
 *         { field: "resources.type", equals: ["AWS::S3::Object"] },
 *       ],
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const EventDataStore: import("../../Resource.ts").ResourceClass<EventDataStore>;
export declare const EventDataStoreProvider: () => import("effect/Layer").Layer<Provider.Provider<EventDataStore>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=EventDataStore.d.ts.map