import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface ClusterParameterGroupProps {
    /**
     * Name of the cluster parameter group. Must be 1-255 lowercase
     * alphanumeric characters or hyphens, starting with a letter, and must
     * not be prefixed `default`. If omitted, a deterministic physical name is
     * generated. Changing the name replaces the parameter group.
     */
    clusterParameterGroupName?: string;
    /**
     * Parameter group family the group applies to, e.g. `redshift-2.0` (or `redshift-1.0`).
     * Changing the family replaces the parameter group.
     */
    family: string;
    /**
     * Human-readable description. Changing the description replaces the
     * parameter group (Redshift descriptions are create-only).
     * @default "Managed by Alchemy"
     */
    description?: string;
    /**
     * Cluster database parameters to override from the family defaults, e.g.
     * `{ enable_user_activity_logging: "true" }`. Parameters removed from
     * this map are reset to their engine defaults.
     */
    parameters?: Record<string, string>;
    /**
     * User-defined tags for the parameter group.
     */
    tags?: Record<string, string>;
}
export interface ClusterParameterGroup extends Resource<"AWS.Redshift.ClusterParameterGroup", ClusterParameterGroupProps, {
    /**
     * Name of the parameter group.
     */
    clusterParameterGroupName: string;
    /**
     * ARN of the parameter group.
     */
    clusterParameterGroupArn: string;
    /**
     * Parameter group family (e.g. `"redshift-2.0"`).
     */
    family: string;
    /**
     * Description of the parameter group.
     */
    description: string | undefined;
    /**
     * Non-default parameter values applied to the group.
     */
    parameters: Record<string, string>;
    /**
     * Tags on the parameter group (including internal Alchemy tags).
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon Redshift cluster parameter group — a named set of database
 * parameters applied to provisioned Redshift clusters.
 *
 * Parameter groups are free and provision instantly. A {@link Cluster}
 * references one by name via `clusterParameterGroupName`; parameter changes
 * take effect after the cluster reboots.
 * ### Creating a Parameter Group
 * **Example:** Default Parameter Group
 * ```typescript
 * const params = yield* Redshift.ClusterParameterGroup("WarehouseParams", {
 *   family: "redshift-2.0",
 * });
 * ```
 * **Example:** Overriding Parameters
 * ```typescript
 * const params = yield* Redshift.ClusterParameterGroup("WarehouseParams", {
 *   family: "redshift-2.0",
 *   parameters: {
 *     enable_user_activity_logging: "true",
 *     statement_timeout: "60000",
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const ClusterParameterGroup: import("../../Resource.ts").ResourceClass<ClusterParameterGroup>;
export declare const ClusterParameterGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<ClusterParameterGroup>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ClusterParameterGroup.d.ts.map