import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface AttributeGroupProps {
    /**
     * Name of the attribute group. Must be unique in the account and region
     * and may only contain letters, numbers, dots, dashes, and underscores.
     * If omitted, a unique name is generated. Changing it replaces the
     * attribute group.
     */
    attributeGroupName?: string;
    /**
     * Description of the attribute group. Updatable in place.
     */
    description?: string;
    /**
     * Open-content metadata for the group as a JSON object (max 8 KB).
     * Updatable in place.
     */
    attributes: Record<string, unknown>;
    /**
     * Tags to apply to the attribute group. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface AttributeGroup extends Resource<"AWS.AppRegistry.AttributeGroup", AttributeGroupProps, {
    /** The auto-generated attribute group ID. */
    attributeGroupId: string;
    /** The ARN of the attribute group. */
    attributeGroupArn: string;
    /** The name of the attribute group. */
    attributeGroupName: string;
}, never, Providers> {
}
/**
 * An AWS Service Catalog AppRegistry attribute group — a named container of
 * user-defined JSON metadata that can be associated with applications to
 * enrich them (owner, cost center, compliance posture, etc.).
 *
 * ### Creating an Attribute Group
 * **Example:** Basic Attribute Group
 * ```typescript
 * import * as AppRegistry from "alchemy/AWS/AppRegistry";
 *
 * const group = yield* AppRegistry.AttributeGroup("Ownership", {
 *   attributes: {
 *     owner: "commerce-team",
 *     costCenter: "1234",
 *   },
 * });
 * ```
 *
 * **Example:** Attribute Group with Description and Tags
 * ```typescript
 * const group = yield* AppRegistry.AttributeGroup("Ownership", {
 *   attributeGroupName: "storefront-ownership",
 *   description: "Ownership metadata for the storefront",
 *   attributes: { owner: "commerce-team" },
 *   tags: { team: "commerce" },
 * });
 * ```
 *
 * @resource
 */
export declare const AttributeGroup: import("../../Resource.ts").ResourceClass<AttributeGroup>;
export declare const AttributeGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<AttributeGroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=AttributeGroup.d.ts.map