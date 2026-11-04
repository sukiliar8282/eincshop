import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * The query that determines which AWS resources are members of a group.
 */
export interface GroupResourceQuery {
    /**
     * The type of the query.
     *
     * - `TAG_FILTERS_1_0` — a tag-based query; `query` is a JSON string with
     *   `ResourceTypeFilters` and `TagFilters`.
     * - `CLOUDFORMATION_STACK_1_0` — a CloudFormation stack-based query;
     *   `query` is a JSON string with `ResourceTypeFilters` and `StackIdentifier`.
     */
    type: "TAG_FILTERS_1_0" | "CLOUDFORMATION_STACK_1_0";
    /**
     * The query expression as a JSON string. See the *Resource Groups User
     * Guide* for the query syntax of each query type.
     */
    query: string;
}
/**
 * A parameter of a group configuration item.
 */
export interface GroupConfigurationParameter {
    /**
     * The name of the parameter, e.g. `allowed-resource-types`.
     */
    name: string;
    /**
     * The values of the parameter.
     */
    values?: string[];
}
/**
 * An item of an AWS service configuration attached to a resource group.
 */
export interface GroupConfigurationItem {
    /**
     * The configuration type, e.g. `AWS::ResourceGroups::Generic` or
     * `AWS::EC2::CapacityReservationPool`.
     */
    type: string;
    /**
     * Parameters of the configuration item.
     */
    parameters?: GroupConfigurationParameter[];
}
export interface GroupProps {
    /**
     * Name of the resource group. If omitted, a unique name is generated from
     * the app, stage and logical ID. Changing it replaces the group.
     */
    groupName?: string;
    /**
     * A description of the resource group.
     */
    description?: string;
    /**
     * The resource query that determines the group's members. Mutually
     * exclusive with `configuration`.
     */
    resourceQuery?: GroupResourceQuery;
    /**
     * An AWS service configuration attached to the group (a
     * configuration-based group). Mutually exclusive with `resourceQuery`.
     * Adding or removing the configuration entirely replaces the group.
     */
    configuration?: GroupConfigurationItem[];
    /**
     * User tags to attach to the group. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Group extends Resource<"AWS.ResourceGroups.Group", GroupProps, {
    /** The name of the resource group. */
    groupName: string;
    /** The ARN of the resource group. */
    groupArn: string;
}, never, Providers> {
}
/**
 * An AWS Resource Groups group — a collection of AWS resources defined by a
 * tag-based query, a CloudFormation stack query, or an attached service
 * configuration.
 *
 * Deleting a group never deletes its member resources; it only deletes the
 * group structure.
 *
 * ### Creating Groups
 * **Example:** Tag-based Group
 * ```typescript
 * import * as ResourceGroups from "alchemy/AWS/ResourceGroups";
 *
 * const group = yield* ResourceGroups.Group("EnvGroup", {
 *   description: "All resources tagged env=prod",
 *   resourceQuery: {
 *     type: "TAG_FILTERS_1_0",
 *     query: JSON.stringify({
 *       ResourceTypeFilters: ["AWS::AllSupported"],
 *       TagFilters: [{ Key: "env", Values: ["prod"] }],
 *     }),
 *   },
 * });
 * ```
 *
 * **Example:** CloudFormation Stack Group
 * ```typescript
 * const group = yield* ResourceGroups.Group("StackGroup", {
 *   resourceQuery: {
 *     type: "CLOUDFORMATION_STACK_1_0",
 *     query: JSON.stringify({
 *       ResourceTypeFilters: ["AWS::AllSupported"],
 *       StackIdentifier: stackArn,
 *     }),
 *   },
 * });
 * ```
 *
 * ### Service Configurations
 * **Example:** Capacity Reservation Pool Group
 * ```typescript
 * const pool = yield* ResourceGroups.Group("ReservationPool", {
 *   configuration: [
 *     {
 *       type: "AWS::ResourceGroups::Generic",
 *       parameters: [
 *         {
 *           name: "allowed-resource-types",
 *           values: ["AWS::EC2::CapacityReservation"],
 *         },
 *       ],
 *     },
 *     { type: "AWS::EC2::CapacityReservationPool" },
 *   ],
 * });
 * ```
 *
 * ### Tagging
 * **Example:** Group with Tags
 * ```typescript
 * const group = yield* ResourceGroups.Group("TaggedGroup", {
 *   resourceQuery: {
 *     type: "TAG_FILTERS_1_0",
 *     query: JSON.stringify({
 *       ResourceTypeFilters: ["AWS::AllSupported"],
 *       TagFilters: [{ Key: "team", Values: ["platform"] }],
 *     }),
 *   },
 *   tags: { team: "platform" },
 * });
 * ```
 *
 * @resource
 */
export declare const Group: import("../../Resource.ts").ResourceClass<Group>;
declare const ResourceGroupDefinitionConflict_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ResourceGroupDefinitionConflict";
} & Readonly<A>;
/**
 * Raised when a `Group` is configured with both `resourceQuery` and
 * `configuration`. A resource group is defined by exactly one of the two.
 */
export declare class ResourceGroupDefinitionConflict extends ResourceGroupDefinitionConflict_base<{
    message: string;
}> {
}
export declare const GroupProvider: () => import("effect/Layer").Layer<Provider.Provider<Group>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Group.d.ts.map