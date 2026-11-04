import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface SchemaAttribute {
    /** Name of the field in the dataset (e.g. `item_id`, `timestamp`). */
    attributeName: string;
    /** Type of the field: `string`, `integer`, `float`, `timestamp`, or `geolocation`. */
    attributeType: string;
}
export interface DatasetSchema {
    /** The ordered list of fields that make up the dataset. */
    attributes: SchemaAttribute[];
}
export interface DatasetEncryptionConfig {
    /** ARN of the IAM role Forecast assumes to access the KMS key. */
    roleArn: string;
    /** ARN of the customer-managed KMS key. */
    kmsKeyArn: string;
}
export interface DatasetProps {
    /**
     * Name of the dataset. If omitted, a unique name is generated from the app,
     * stage, and logical ID. Changing the name replaces the dataset.
     */
    datasetName?: string;
    /**
     * The forecasting domain: `RETAIL`, `CUSTOM`, `INVENTORY_PLANNING`,
     * `EC2_CAPACITY`, `WORK_FORCE`, `WEB_TRAFFIC`, or `METRICS`. Immutable —
     * changing it replaces the dataset.
     */
    domain: string;
    /**
     * The dataset type: `TARGET_TIME_SERIES`, `RELATED_TIME_SERIES`, or
     * `ITEM_METADATA`. Immutable — changing it replaces the dataset.
     */
    datasetType: string;
    /**
     * The frequency of data collection (e.g. `D` for daily, `H` for hourly).
     * Required for time-series datasets. Immutable — changing it replaces the
     * dataset.
     */
    dataFrequency?: string;
    /**
     * The schema describing the dataset's fields. Immutable — changing it
     * replaces the dataset.
     */
    schema: DatasetSchema;
    /**
     * Customer-managed KMS encryption configuration. Immutable — changing it
     * replaces the dataset.
     */
    encryptionConfig?: DatasetEncryptionConfig;
    /**
     * User-defined tags for the dataset.
     */
    tags?: Record<string, string>;
}
export interface Dataset extends Resource<"AWS.Forecast.Dataset", DatasetProps, {
    /** The ARN of the dataset. */
    datasetArn: string;
    /** The name of the dataset. */
    datasetName: string;
    /** The forecasting domain of the dataset, e.g. `RETAIL` or `CUSTOM`. */
    domain: string;
    /** The dataset type, e.g. `TARGET_TIME_SERIES`. */
    datasetType: string;
    /** The dataset status, e.g. `ACTIVE`. */
    status: string;
}, never, Providers> {
}
/**
 * An Amazon Forecast dataset — a typed, domain-scoped collection of
 * time-series (or metadata) records described by a schema. Creating the
 * dataset is a cheap metadata operation; bulk imports and training happen
 * through separate import jobs and predictors.
 *
 * ### Creating a Dataset
 * **Example:** Target Time-Series Dataset
 * ```typescript
 * const dataset = yield* Forecast.Dataset("Demand", {
 *   domain: "CUSTOM",
 *   datasetType: "TARGET_TIME_SERIES",
 *   dataFrequency: "D",
 *   schema: {
 *     attributes: [
 *       { attributeName: "item_id", attributeType: "string" },
 *       { attributeName: "timestamp", attributeType: "timestamp" },
 *       { attributeName: "target_value", attributeType: "float" },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Dataset: import("../../Resource.ts").ResourceClass<Dataset>;
export declare const DatasetProvider: () => import("effect/Layer").Layer<Provider.Provider<Dataset>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Dataset.d.ts.map