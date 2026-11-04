import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * The policy template of a customer managed permission — the actions a
 * resource share grants to principals for the permission's resource type.
 * RAM policy templates only support `Effect: "Allow"` with `Action` and an
 * optional `Condition`; the `Principal` and `Resource` are supplied by the
 * resource share at association time.
 */
export interface PermissionPolicyTemplate {
    /**
     * Actions granted to principals the resource share is shared with. Must be
     * a subset of the actions RAM supports for the permission's `resourceType`
     * (for example `appsync:SourceGraphQL` for `appsync:Apis`).
     */
    actions: string[];
    /**
     * Optional IAM condition block constraining when the actions are granted.
     */
    condition?: Record<string, unknown>;
}
export interface PermissionProps {
    /**
     * Name of the customer managed permission. Must be unique within your
     * account and Region. If omitted, Alchemy generates a deterministic name
     * from the stack, stage, and logical ID. Max 36 characters.
     * Changing the name replaces the permission.
     */
    permissionName?: string;
    /**
     * The resource type this permission applies to, in `service:Type` format —
     * for example `appsync:Apis`. Only some resource types support customer
     * managed permissions (others, like `ec2:Subnet`, only allow the AWS
     * managed default permission).
     * Changing the resource type replaces the permission.
     */
    resourceType: string;
    /**
     * The policy template granted by resource shares using this permission.
     * Changing the template creates a new permission version and promotes it
     * to the default; the previous default version is deleted when it is no
     * longer attached to any resource share.
     */
    policyTemplate: PermissionPolicyTemplate;
    /**
     * Tags applied to the permission.
     */
    tags?: Record<string, string>;
}
export interface Permission extends Resource<"AWS.RAM.Permission", PermissionProps, {
    /** ARN of the customer managed permission. */
    permissionArn: string;
    /** Name of the permission. */
    name: string;
    /** The resource type the permission applies to. */
    resourceType: string;
    /** The default version number of the permission. */
    version: string | undefined;
    /** Current status (`ATTACHABLE`, `UNATTACHABLE`, `DELETING`, ...). */
    status: string | undefined;
    /** Tags applied to the permission. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS Resource Access Manager (RAM) customer managed permission.
 *
 * A customer managed permission precisely controls which actions principals
 * receive on resources of a given type when you attach the permission to a
 * {@link ResourceShare} via `permissionArns`.
 *
 * ### Creating a Permission
 * **Example:** Least-privilege AppSync API sharing
 * ```typescript
 * const permission = yield* Permission("SourceGraphQLOnly", {
 *   resourceType: "appsync:Apis",
 *   policyTemplate: {
 *     actions: ["appsync:SourceGraphQL"],
 *   },
 * });
 * ```
 *
 * **Example:** Attach a permission to a resource share
 * ```typescript
 * const share = yield* ResourceShare("ApiShare", {
 *   resourceArns: [api.apiArn],
 *   principals: ["123456789012"],
 *   permissionArns: [permission.permissionArn],
 * });
 * ```
 *
 * ### Updating the Policy
 * **Example:** Add an action (creates a new default version)
 * ```typescript
 * const permission = yield* Permission("SourceGraphQLOnly", {
 *   resourceType: "appsync:Apis",
 *   policyTemplate: {
 *     actions: ["appsync:SourceGraphQL", "appsync:GraphQL"],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Permission: import("../../Resource.ts").ResourceClass<Permission>;
export declare const PermissionProvider: () => import("effect/Layer").Layer<Provider.Provider<Permission>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Permission.d.ts.map