import * as iam from "@distilled.cloud/cloudflare/iam";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Iam.ResourceGroup";
type TypeId = typeof TypeId;
/**
 * The scope of a resource group — a scope key (e.g.
 * `com.cloudflare.api.account.{accountId}`) plus the objects it contains
 * (e.g. `com.cloudflare.api.account.zone.{zoneId}` or `*` for everything
 * in the scope).
 */
export interface ResourceGroupScopeInput {
    /**
     * The scope key, e.g. `com.cloudflare.api.account.{accountId}`.
     */
    key: string;
    /**
     * The objects within the scope this resource group spans, e.g.
     * `com.cloudflare.api.account.zone.{zoneId}` or `*`.
     */
    objects: {
        key: string;
    }[];
}
/**
 * A fully-resolved resource group scope as observed on Cloudflare.
 */
export interface ResourceGroupScope {
    /** The scope key, e.g. `com.cloudflare.api.account.{accountId}`. */
    key: string;
    /** The objects within the scope this resource group spans. */
    objects: {
        key: string;
    }[];
}
export interface ResourceGroupProps {
    /**
     * Name of the resource group. If omitted, a unique name is generated
     * from the app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * The scope of the resource group: a scope key (typically
     * `com.cloudflare.api.account.{accountId}`) and the objects it
     * contains (zones, or `*` for the whole account). Mutable in place.
     */
    scope: ResourceGroupScopeInput;
}
export interface ResourceGroupAttributes {
    /** Cloudflare-assigned identifier of the resource group. */
    resourceGroupId: string;
    /** The Cloudflare account the resource group belongs to. */
    accountId: string;
    /** Name of the resource group. */
    name: string;
    /** The scope of the resource group as observed on Cloudflare. */
    scope: ResourceGroupScope;
}
export type ResourceGroup = Resource<TypeId, ResourceGroupProps, ResourceGroupAttributes, never, Providers>;
/**
 * A Cloudflare IAM resource group — a named set of account resources
 * (zones, or the whole account) that fine-grained policies attach to.
 *
 * Resource groups pair with permission groups inside a user group policy:
 * the permission group says *what* actions are allowed, the resource group
 * says *which* resources they apply to. Both `name` and `scope` are mutable
 * in place.
 *
 * Account-scoped IAM (resource groups, user groups) is an Enterprise
 * feature.
 * ### Creating a Resource Group
 * **Example:** Scope a group to the whole account
 * ```typescript
 * const { accountId } = yield* yield* Cloudflare.CloudflareEnvironment;
 * const group = yield* Cloudflare.Iam.ResourceGroup("AllResources", {
 *   scope: {
 *     key: `com.cloudflare.api.account.${accountId}`,
 *     objects: [{ key: "*" }],
 *   },
 * });
 * ```
 *
 * **Example:** Scope a group to a single zone
 * ```typescript
 * const group = yield* Cloudflare.Iam.ResourceGroup("ZoneOnly", {
 *   name: "my-zone-resources",
 *   scope: {
 *     key: `com.cloudflare.api.account.${accountId}`,
 *     objects: [
 *       { key: `com.cloudflare.api.account.zone.${zone.zoneId}` },
 *     ],
 *   },
 * });
 * ```
 *
 * ### Using with User Groups
 * **Example:** Attach to a user group policy
 * ```typescript
 * yield* Cloudflare.Iam.UserGroup("Readers", {
 *   policies: [
 *     {
 *       access: "allow",
 *       permissionGroups: [readOnlyPermissionGroupId],
 *       resourceGroups: [group.resourceGroupId],
 *     },
 *   ],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/fundamentals/manage-members/scoped-roles/
 *
 * @resource
 * @product IAM
 * @category Account & Identity
 */
export declare const ResourceGroup: import("../../Resource.ts").ResourceClass<ResourceGroup>;
/**
 * Returns true if the given value is an ResourceGroup resource.
 */
export declare const isResourceGroup: (value: unknown) => value is ResourceGroup;
export declare const ResourceGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<ResourceGroup>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | iam.CloudflareOpContext>;
export {};
//# sourceMappingURL=ResourceGroup.d.ts.map