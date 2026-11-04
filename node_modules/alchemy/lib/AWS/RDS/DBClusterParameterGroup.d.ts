import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface DBClusterParameterGroupProps {
    /**
     * Name of the parameter group. If omitted, Alchemy generates one.
     */
    dbClusterParameterGroupName?: string;
    /**
     * Parameter group family, for example `aurora-postgresql16`.
     */
    family: string;
    /**
     * Human-readable description.
     */
    description?: string;
    /**
     * User-defined tags.
     */
    tags?: Record<string, string>;
}
export interface DBClusterParameterGroup extends Resource<"AWS.RDS.DBClusterParameterGroup", DBClusterParameterGroupProps, {
    /**
     * Name of the cluster parameter group.
     */
    dbClusterParameterGroupName: string;
    /**
     * ARN of the cluster parameter group.
     */
    dbClusterParameterGroupArn: string | undefined;
    /**
     * Parameter group family (e.g. `aurora-postgresql16`).
     */
    family: string;
    /**
     * Description of the parameter group.
     */
    description: string | undefined;
    /**
     * Tags on the parameter group.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Aurora cluster parameter group — cluster-wide engine settings shared by
 * every instance in a `DBCluster`.
 *
 * Name, family, and description changes force a replacement (RDS has no
 * modify API for these); tags update in place.
 * ### Creating a Cluster Parameter Group
 * **Example:** Parameter Group for Aurora Postgres 16
 * ```typescript
 * const clusterParams = yield* DBClusterParameterGroup("ClusterParams", {
 *   family: "aurora-postgresql16",
 *   description: "Cluster-wide settings for the app database",
 * });
 * ```
 *
 * **Example:** Attach to a Cluster
 * ```typescript
 * const cluster = yield* DBCluster("Cluster", {
 *   engine: "aurora-postgresql",
 *   dbClusterParameterGroupName: clusterParams.dbClusterParameterGroupName,
 * });
 * ```
 *
 * @resource
 */
export declare const DBClusterParameterGroup: import("../../Resource.ts").ResourceClass<DBClusterParameterGroup>;
export declare const DBClusterParameterGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<DBClusterParameterGroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DBClusterParameterGroup.d.ts.map