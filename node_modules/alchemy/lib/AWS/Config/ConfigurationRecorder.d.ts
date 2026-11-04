import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface RecordingGroupProps {
    /**
     * Record every supported (regional) resource type. Mutually exclusive
     * with `resourceTypes`.
     * @default false
     */
    allSupported?: boolean;
    /**
     * Also record global resource types (e.g. IAM). Only meaningful with
     * `allSupported: true`.
     * @default false
     */
    includeGlobalResourceTypes?: boolean;
    /**
     * The specific resource types to record, e.g. `AWS::S3::Bucket`. Only
     * meaningful when `allSupported` is `false`.
     */
    resourceTypes?: string[];
    /**
     * Resource types to exclude from recording. Requires
     * `recordingStrategy.useOnly: "EXCLUSION_BY_RESOURCE_TYPES"`.
     */
    exclusionByResourceTypes?: {
        /**
         * The resource types excluded from recording.
         */
        resourceTypes: string[];
    };
    /**
     * Which recording strategy the recorder uses.
     */
    recordingStrategy?: {
        /**
         * `ALL_SUPPORTED_RESOURCE_TYPES`, `INCLUSION_BY_RESOURCE_TYPES`, or
         * `EXCLUSION_BY_RESOURCE_TYPES`.
         */
        useOnly?: "ALL_SUPPORTED_RESOURCE_TYPES" | "INCLUSION_BY_RESOURCE_TYPES" | "EXCLUSION_BY_RESOURCE_TYPES";
    };
}
export interface RecordingModeProps {
    /**
     * The default recording frequency for all recorded resource types.
     */
    recordingFrequency: "CONTINUOUS" | "DAILY";
    /**
     * Per-resource-type overrides of the recording frequency.
     */
    recordingModeOverrides?: {
        /**
         * Description of the override.
         */
        description?: string;
        /**
         * The resource types the override applies to.
         */
        resourceTypes: string[];
        /**
         * The recording frequency for the overridden resource types.
         */
        recordingFrequency: "CONTINUOUS" | "DAILY";
    }[];
}
export interface ConfigurationRecorderProps {
    /**
     * Name of the configuration recorder. AWS allows only ONE customer
     * managed configuration recorder per account per region. Changing the
     * name replaces the recorder.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * ARN of the IAM role the recorder assumes to read your resources'
     * configurations, e.g. the `AWSServiceRoleForConfig` service-linked role
     * (`arn:aws:iam::{account}:role/aws-service-role/config.amazonaws.com/AWSServiceRoleForConfig`).
     */
    roleArn: string;
    /**
     * Which resource types the recorder records.
     * @default all supported resource types
     */
    recordingGroup?: RecordingGroupProps;
    /**
     * How frequently the recorder records configuration changes.
     * @default CONTINUOUS
     */
    recordingMode?: RecordingModeProps;
    /**
     * Desired recording state. `true` starts the recorder (requires a
     * delivery channel), `false` stops it. When omitted the recording state
     * is left untouched.
     */
    recording?: boolean;
    /**
     * Tags to apply to the recorder. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface ConfigurationRecorder extends Resource<"AWS.Config.ConfigurationRecorder", ConfigurationRecorderProps, {
    /** Physical name of the configuration recorder. */
    recorderName: string;
    /** ARN of the configuration recorder. */
    recorderArn: string;
}, never, Providers> {
}
/**
 * The AWS Config configuration recorder that detects and records changes to
 * your AWS resource configurations.
 *
 * AWS allows only **one** customer managed configuration recorder per
 * account per region — treat this resource as an account-region singleton.
 * Starting the recorder (`recording: true`) requires a delivery channel
 * (see `AWS.Config.DeliveryChannel`) and incurs per-configuration-item
 * charges.
 * ### Creating the Recorder
 * **Example:** Recorder with the Config service-linked role
 * ```typescript
 * import * as Config from "alchemy/AWS/Config";
 *
 * const recorder = yield* Config.ConfigurationRecorder("Recorder", {
 *   roleArn: `arn:aws:iam::${accountId}:role/aws-service-role/config.amazonaws.com/AWSServiceRoleForConfig`,
 *   recordingGroup: { allSupported: true },
 * });
 * ```
 *
 * **Example:** Record only specific resource types
 * ```typescript
 * const recorder = yield* Config.ConfigurationRecorder("Recorder", {
 *   roleArn: serviceLinkedRoleArn,
 *   recordingGroup: {
 *     resourceTypes: ["AWS::S3::Bucket", "AWS::EC2::SecurityGroup"],
 *   },
 * });
 * ```
 *
 * ### Recording State
 * **Example:** Start recording (requires a delivery channel)
 * ```typescript
 * const channel = yield* Config.DeliveryChannel("Channel", {
 *   s3BucketName: bucket.bucketName,
 * });
 * const recorder = yield* Config.ConfigurationRecorder("Recorder", {
 *   roleArn: serviceLinkedRoleArn,
 *   recording: true,
 * });
 * ```
 *
 * @resource
 */
export declare const ConfigurationRecorder: import("../../Resource.ts").ResourceClass<ConfigurationRecorder>;
export declare const ConfigurationRecorderProvider: () => import("effect/Layer").Layer<Provider.Provider<ConfigurationRecorder>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ConfigurationRecorder.d.ts.map