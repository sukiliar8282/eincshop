import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface DatasetGroupProps {
    /**
     * Name of the dataset group. If omitted, a unique name is generated from the
     * app, stage, and logical ID. Changing the name replaces the group.
     */
    name?: string;
    /**
     * ARN of an IAM role Personalize assumes to access a customer-managed KMS
     * key. Immutable — changing it replaces the group.
     */
    roleArn?: string;
    /**
     * ARN of a customer-managed KMS key used to encrypt the datasets. Immutable
     * — changing it replaces the group.
     */
    kmsKeyArn?: string;
    /**
     * The domain of a domain dataset group (`ECOMMERCE` or `VIDEO_ON_DEMAND`).
     * Omit for a custom dataset group. Immutable — changing it replaces the
     * group.
     */
    domain?: string;
    /**
     * User-defined tags for the dataset group.
     */
    tags?: Record<string, string>;
}
export interface DatasetGroup extends Resource<"AWS.Personalize.DatasetGroup", DatasetGroupProps, {
    /**
     * ARN of the dataset group.
     */
    datasetGroupArn: string;
    /**
     * Name of the dataset group.
     */
    name: string;
    /**
     * Dataset group status (e.g. `ACTIVE`, `CREATE PENDING`).
     */
    status: string;
    /**
     * Domain of the dataset group (`ECOMMERCE` or `VIDEO_ON_DEMAND`) when
     * it is a domain dataset group.
     */
    domain: string | undefined;
}, never, Providers> {
}
/**
 * An Amazon Personalize dataset group — the top-level container that holds the
 * datasets, solutions, and campaigns for a single use case. Creating a dataset
 * group is cheap and fast; the expensive training work lives in solutions and
 * campaigns provisioned separately.
 *
 * ### Creating a Dataset Group
 * **Example:** Custom Dataset Group
 * ```typescript
 * const group = yield* Personalize.DatasetGroup("Recommendations", {});
 * ```
 *
 * **Example:** Domain Dataset Group with Encryption
 * ```typescript
 * const group = yield* Personalize.DatasetGroup("Storefront", {
 *   domain: "ECOMMERCE",
 *   roleArn: role.roleArn,
 *   kmsKeyArn: key.keyArn,
 *   tags: { team: "growth" },
 * });
 * ```
 *
 * @resource
 */
export declare const DatasetGroup: import("../../Resource.ts").ResourceClass<DatasetGroup>;
export declare const DatasetGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<DatasetGroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DatasetGroup.d.ts.map