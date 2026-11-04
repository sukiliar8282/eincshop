import * as sagemaker from "@distilled.cloud/aws/sagemaker";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type FeatureGroupStatus = sagemaker.FeatureGroupStatus;
export interface FeatureGroupProps {
    /**
     * Name of the feature group. Maximum 64 characters, alphanumeric and
     * hyphens.
     * @default ${app}-${stage}-${id}
     */
    featureGroupName?: string;
    /**
     * The name of the feature whose value uniquely identifies a record. Must
     * be one of the `featureDefinitions`.
     */
    recordIdentifierFeatureName: string;
    /**
     * The name of the feature that stores each record's event time (an ISO
     * 8601 string or unix seconds). Must be one of the `featureDefinitions`.
     */
    eventTimeFeatureName: string;
    /**
     * The schema: every feature's name and type (`String`, `Integral`,
     * `Fractional`).
     */
    featureDefinitions: sagemaker.FeatureDefinition[];
    /**
     * Enable the low-latency online store (required for
     * `GetRecord`/`PutRecord` runtime bindings).
     */
    onlineStoreConfig?: sagemaker.OnlineStoreConfig;
    /**
     * Replicate writes to an S3-backed offline store (for training). Requires
     * `roleArn`.
     */
    offlineStoreConfig?: sagemaker.OfflineStoreConfig;
    /**
     * Provisioned or on-demand read/write throughput for the online store.
     */
    throughputConfig?: sagemaker.ThroughputConfig;
    /**
     * ARN of the IAM role SageMaker assumes to write the offline store to S3.
     * Only required when `offlineStoreConfig` is set.
     */
    roleArn?: string;
    /**
     * A description of the feature group.
     */
    description?: string;
    /**
     * Tags to associate with the feature group. Merged with internal Alchemy
     * tags.
     */
    tags?: Record<string, string>;
}
export interface FeatureGroup extends Resource<"AWS.SageMaker.FeatureGroup", FeatureGroupProps, {
    /**
     * The feature group's name.
     */
    featureGroupName: string;
    /**
     * ARN of the feature group.
     */
    featureGroupArn: string;
    /**
     * The record-identifier feature name.
     */
    recordIdentifierFeatureName: string;
    /**
     * The event-time feature name.
     */
    eventTimeFeatureName: string;
}, never, Providers> {
}
/**
 * An Amazon SageMaker Feature Store FeatureGroup — a typed, versioned table
 * of ML features with an optional low-latency online store (for inference
 * lookups) and an S3-backed offline store (for training).
 *
 * With the online store enabled, functions read and write records at runtime
 * via the `AWS.SageMaker.GetRecord` / `AWS.SageMaker.PutRecord` bindings.
 * ### Creating Feature Groups
 * **Example:** Online-Store Feature Group
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const features = yield* AWS.SageMaker.FeatureGroup("UserFeatures", {
 *   recordIdentifierFeatureName: "user_id",
 *   eventTimeFeatureName: "event_time",
 *   featureDefinitions: [
 *     { FeatureName: "user_id", FeatureType: "String" },
 *     { FeatureName: "event_time", FeatureType: "String" },
 *     { FeatureName: "clicks", FeatureType: "Integral" },
 *   ],
 *   onlineStoreConfig: { EnableOnlineStore: true },
 * });
 * ```
 *
 * ### Runtime Access
 * **Example:** Read and write records from a Lambda function
 * ```typescript
 * // init
 * const putRecord = yield* AWS.SageMaker.PutRecord(features);
 * const getRecord = yield* AWS.SageMaker.GetRecord(features);
 *
 * // runtime
 * yield* putRecord({
 *   Record: [
 *     { FeatureName: "user_id", ValueAsString: "user-123" },
 *     { FeatureName: "event_time", ValueAsString: new Date().toISOString() },
 *     { FeatureName: "clicks", ValueAsString: "42" },
 *   ],
 * });
 * const { Record } = yield* getRecord({
 *   RecordIdentifierValueAsString: "user-123",
 * });
 * ```
 *
 * @resource
 */
export declare const FeatureGroup: import("../../Resource.ts").ResourceClass<FeatureGroup>;
declare const FeatureGroupCreateFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "FeatureGroupCreateFailed";
} & Readonly<A>;
/**
 * The feature group's asynchronous creation converged to the terminal
 * `CreateFailed` status.
 */
export declare class FeatureGroupCreateFailed extends FeatureGroupCreateFailed_base<{
    readonly featureGroupName: string;
    readonly message: string | undefined;
}> {
}
export declare const FeatureGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<FeatureGroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=FeatureGroup.d.ts.map