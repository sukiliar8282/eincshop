import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ParameterGroupProps {
    /**
     * Name of the parameter group. Must be 1-40 characters. If omitted, a
     * deterministic physical name is generated. Changing the name replaces the
     * parameter group.
     */
    parameterGroupName?: string;
    /**
     * Parameter group family the group belongs to, e.g. `"memorydb_valkey7"`,
     * `"memorydb_valkey8"`, `"memorydb_redis7"`. Changing the family replaces
     * the parameter group.
     */
    family: string;
    /**
     * Human-readable description of the parameter group. The MemoryDB API has
     * no update for descriptions, so changing it replaces the parameter group.
     */
    description?: string;
    /**
     * Engine parameter overrides (name → value), e.g.
     * `{ "maxmemory-policy": "allkeys-lru" }`. Parameters removed from this map
     * are reset to the engine default.
     * @default {} (engine defaults)
     */
    parameters?: Record<string, string>;
    /**
     * User-defined tags for the parameter group.
     */
    tags?: Record<string, string>;
}
export interface ParameterGroup extends Resource<"AWS.MemoryDB.ParameterGroup", ParameterGroupProps, {
    /** Name of the parameter group. */
    parameterGroupName: string;
    /** ARN of the parameter group. */
    parameterGroupArn: string;
    /** Parameter group family (e.g. `memorydb_valkey7`). */
    family: string | undefined;
    /** Description of the parameter group. */
    description: string | undefined;
    /** Tags on the parameter group (user + internal Alchemy tags). */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A MemoryDB parameter group — a named collection of engine parameter
 * overrides applied to every node of any {@link Cluster} that references it
 * via `parameterGroupName`.
 *
 * Parameter groups are free and provision instantly. Parameters not listed
 * keep their engine defaults; removing a parameter from `parameters` resets
 * it to the default.
 * ### Creating a Parameter Group
 * **Example:** Parameter Group with an Eviction Policy
 * ```typescript
 * const params = yield* ParameterGroup("CacheParams", {
 *   family: "memorydb_valkey7",
 *   description: "LRU eviction for the session cache",
 *   parameters: { "maxmemory-policy": "allkeys-lru" },
 * });
 * const cluster = yield* Cluster("Cache", {
 *   aclName: acl.aclName,
 *   parameterGroupName: params.parameterGroupName,
 * });
 * ```
 *
 * @resource
 */
export declare const ParameterGroup: import("../../Resource.ts").ResourceClass<ParameterGroup>;
export declare const ParameterGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<ParameterGroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ParameterGroup.d.ts.map