import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface DatasetGroupProps {
    /**
     * Name of the dataset group. If omitted, a unique name is generated from the
     * app, stage, and logical ID. Changing the name replaces the group.
     */
    datasetGroupName?: string;
    /**
     * The forecasting domain: `RETAIL`, `CUSTOM`, `INVENTORY_PLANNING`,
     * `EC2_CAPACITY`, `WORK_FORCE`, `WEB_TRAFFIC`, or `METRICS`. Immutable —
     * changing it replaces the group.
     */
    domain: string;
    /**
     * ARNs of the datasets to attach to the group. This is an in-place update —
     * changing the set re-associates the datasets without replacing the group.
     */
    datasetArns?: string[];
    /**
     * User-defined tags for the dataset group.
     */
    tags?: Record<string, string>;
}
export interface DatasetGroup extends Resource<"AWS.Forecast.DatasetGroup", DatasetGroupProps, {
    /** The ARN of the dataset group. */
    datasetGroupArn: string;
    /** The name of the dataset group. */
    datasetGroupName: string;
    /** The forecasting domain of the group, e.g. `RETAIL` or `CUSTOM`. */
    domain: string;
    /** The dataset group status, e.g. `ACTIVE`. */
    status: string;
}, never, Providers> {
}
/**
 * An Amazon Forecast dataset group — a domain-scoped container that groups the
 * datasets used to train predictors. Creating the group is cheap; the
 * expensive training work lives in predictors and forecasts provisioned
 * separately.
 *
 * ### Creating a Dataset Group
 * **Example:** Custom Dataset Group
 * ```typescript
 * const group = yield* Forecast.DatasetGroup("Sales", {
 *   domain: "CUSTOM",
 * });
 * ```
 *
 * **Example:** Dataset Group with Attached Datasets
 * ```typescript
 * const group = yield* Forecast.DatasetGroup("Sales", {
 *   domain: "RETAIL",
 *   datasetArns: [dataset.datasetArn],
 *   tags: { team: "planning" },
 * });
 * ```
 *
 * @resource
 */
export declare const DatasetGroup: import("../../Resource.ts").ResourceClass<DatasetGroup>;
export declare const DatasetGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<DatasetGroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DatasetGroup.d.ts.map