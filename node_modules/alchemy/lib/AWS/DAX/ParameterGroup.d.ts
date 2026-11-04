import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ParameterGroupProps {
    /**
     * Name of the parameter group. If omitted, a deterministic physical name
     * is generated. Changing the name replaces the parameter group.
     */
    parameterGroupName?: string;
    /**
     * Human-readable description of the parameter group.
     */
    description?: string;
    /**
     * Parameter overrides, e.g. `{ "query-ttl-millis": "60000" }`. DAX exposes
     * two tunable parameters: `query-ttl-millis` and `record-ttl-millis`.
     * DAX has no reset-to-default API, so a key removed from this map keeps
     * its last applied value.
     */
    parameters?: Record<string, string>;
}
export interface ParameterGroup extends Resource<"AWS.DAX.ParameterGroup", ParameterGroupProps, {
    /** Name of the parameter group. */
    parameterGroupName: string;
    /** Description of the parameter group. */
    description: string | undefined;
    /** Current non-default parameter values, keyed by parameter name. */
    parameters: Record<string, string>;
}, never, Providers> {
}
/**
 * A DAX parameter group — a named set of DAX engine parameters (item and
 * query cache TTLs) that can be attached to one or more DAX
 * {@link Cluster}s.
 *
 * Parameter groups are free and provision instantly. DAX does not support
 * tags on parameter groups.
 * ### Creating a Parameter Group
 * **Example:** Parameter Group with Custom Cache TTLs
 * ```typescript
 * const params = yield* ParameterGroup("DaxParams", {
 *   description: "5 minute item and query TTLs",
 *   parameters: {
 *     "query-ttl-millis": "300000",
 *     "record-ttl-millis": "300000",
 *   },
 * });
 * ```
 *
 * ### Attaching to a Cluster
 * **Example:** Cluster Using the Parameter Group
 * ```typescript
 * const cluster = yield* Cluster("Cache", {
 *   nodeType: "dax.t3.small",
 *   replicationFactor: 1,
 *   iamRoleArn: role.roleArn,
 *   parameterGroupName: params.parameterGroupName,
 * });
 * ```
 *
 * @resource
 */
export declare const ParameterGroup: import("../../Resource.ts").ResourceClass<ParameterGroup>;
export declare const ParameterGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<ParameterGroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ParameterGroup.d.ts.map