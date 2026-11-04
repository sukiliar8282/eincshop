import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface DBParameterGroupProps {
    /**
     * Name of the DB (instance-level) parameter group. If omitted, a
     * deterministic name is generated. Changing it forces replacement.
     */
    dbParameterGroupName?: string;
    /**
     * DB parameter group family, e.g. `neptune1.4`, `neptune1.3`.
     * Immutable — forces replacement.
     */
    family: string;
    /**
     * Description for the parameter group.
     * @default "Managed by Alchemy"
     */
    description?: string;
    /**
     * Instance parameter overrides, e.g.
     * `{ neptune_query_timeout: "120000" }`. Parameters removed from this map
     * are reset to their engine defaults. Static parameters are applied with
     * `pending-reboot`, dynamic parameters with `immediate`.
     */
    parameters?: Record<string, string>;
    /**
     * User-defined tags for the parameter group.
     */
    tags?: Record<string, string>;
}
export interface DBParameterGroup extends Resource<"AWS.Neptune.DBParameterGroup", DBParameterGroupProps, {
    /** Name of the parameter group. */
    dbParameterGroupName: string;
    /** ARN of the parameter group. */
    dbParameterGroupArn: string | undefined;
    /** Parameter group family (e.g. `neptune1.4`). */
    family: string;
    /** Description of the parameter group. */
    description: string | undefined;
    /** Non-default parameter values applied to the group. */
    parameters: Record<string, string>;
    /** Tags on the parameter group (user + internal Alchemy tags). */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon Neptune DB (instance-level) parameter group — a named set of
 * engine configuration parameters applied to individual Neptune
 * {@link DBInstance}s via `dbParameterGroupName` (cluster-wide settings live
 * in a {@link DBClusterParameterGroup} instead).
 * ### Creating a Parameter Group
 * **Example:** Parameter group with a custom query timeout
 * ```typescript
 * const params = yield* DBParameterGroup("InstanceParams", {
 *   family: "neptune1.4",
 *   parameters: {
 *     neptune_query_timeout: "120000",
 *   },
 * });
 * ```
 *
 * ### Attaching to an Instance
 * **Example:** Instance using the parameter group
 * ```typescript
 * const writer = yield* DBInstance("Writer", {
 *   dbClusterIdentifier: cluster.dbClusterIdentifier,
 *   dbInstanceClass: "db.serverless",
 *   dbParameterGroupName: params.dbParameterGroupName,
 * });
 * ```
 *
 * @resource
 */
export declare const DBParameterGroup: import("../../Resource.ts").ResourceClass<DBParameterGroup>;
export declare const DBParameterGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<DBParameterGroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DBParameterGroup.d.ts.map