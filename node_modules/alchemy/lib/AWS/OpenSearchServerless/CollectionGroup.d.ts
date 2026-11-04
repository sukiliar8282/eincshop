import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface CollectionGroupCapacityLimits {
    /**
     * Maximum indexing capacity, in OpenSearch Compute Units (OCUs), shared by
     * the group's collections.
     */
    maxIndexingCapacityInOCU?: number;
    /**
     * Maximum search capacity, in OCUs, shared by the group's collections.
     */
    maxSearchCapacityInOCU?: number;
    /**
     * Minimum indexing capacity, in OCUs, reserved for the group.
     */
    minIndexingCapacityInOCU?: number;
    /**
     * Minimum search capacity, in OCUs, reserved for the group.
     */
    minSearchCapacityInOCU?: number;
}
export interface CollectionGroupProps {
    /**
     * Name of the collection group (3-32 characters, lowercase; must start with
     * a lowercase letter). Changing the name replaces the group.
     * @default a generated physical name
     */
    groupName?: string;
    /**
     * Whether collections in the group deploy redundant standby replicas. Set
     * at creation time; changing it replaces the group.
     * @default "ENABLED"
     */
    standbyReplicas?: "ENABLED" | "DISABLED";
    /**
     * A human-readable description of the collection group.
     */
    description?: string;
    /**
     * OCU capacity limits shared by the collections in the group.
     */
    capacityLimits?: CollectionGroupCapacityLimits;
    /**
     * Tags to apply to the collection group. Merged with the internal Alchemy
     * tags.
     */
    tags?: Record<string, string>;
}
export interface CollectionGroup extends Resource<"AWS.OpenSearchServerless.CollectionGroup", CollectionGroupProps, {
    /**
     * Unique identifier of the collection group.
     */
    collectionGroupId: string;
    /**
     * Name of the collection group.
     */
    collectionGroupName: string;
    /**
     * ARN of the collection group.
     */
    collectionGroupArn: string;
    /**
     * Whether standby replicas are enabled for the group's collections.
     */
    standbyReplicas?: string;
    /**
     * Number of collections currently in the group.
     */
    numberOfCollections?: number;
    /**
     * The capacity generation of the group.
     */
    generation?: string;
}, {}, Providers> {
}
/**
 * An Amazon OpenSearch Serverless collection group. Collection groups manage
 * OpenSearch Compute Units (OCUs) at a group level — multiple collections
 * share the group's capacity limits instead of each collection scaling
 * independently.
 *
 * ### Creating Collection Groups
 * **Example:** Capacity-Bounded Collection Group
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const group = yield* AWS.OpenSearchServerless.CollectionGroup("Group", {
 *   groupName: "analytics",
 *   standbyReplicas: "DISABLED",
 *   capacityLimits: {
 *     maxIndexingCapacityInOCU: 4,
 *     maxSearchCapacityInOCU: 4,
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const CollectionGroup: import("../../Resource.ts").ResourceClass<CollectionGroup>;
export declare const CollectionGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<CollectionGroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=CollectionGroup.d.ts.map