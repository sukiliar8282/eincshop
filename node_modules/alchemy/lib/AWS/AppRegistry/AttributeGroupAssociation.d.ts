import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface AttributeGroupAssociationProps {
    /**
     * The application to associate the attribute group with: its ID, name, or
     * ARN. Changing it replaces the association.
     */
    application: string;
    /**
     * The attribute group to associate: its ID, name, or ARN. Changing it
     * replaces the association.
     */
    attributeGroup: string;
}
export interface AttributeGroupAssociation extends Resource<"AWS.AppRegistry.AttributeGroupAssociation", AttributeGroupAssociationProps, {
    /** The ID of the associated application. */
    applicationId: string;
    /** The ARN of the associated application. */
    applicationArn: string;
    /** The ID of the associated attribute group. */
    attributeGroupId: string;
    /** The ARN of the associated attribute group. */
    attributeGroupArn: string;
}, never, Providers> {
}
/**
 * Associates an AppRegistry {@link AttributeGroup} with an
 * {@link Application} so the group's user-defined JSON metadata augments the
 * application's machine-readable description.
 *
 * ### Associating an Attribute Group
 * **Example:** Attach an Attribute Group to an Application
 * ```typescript
 * import * as AppRegistry from "alchemy/AWS/AppRegistry";
 *
 * const app = yield* AppRegistry.Application("Storefront", {});
 * const group = yield* AppRegistry.AttributeGroup("Ownership", {
 *   attributes: { owner: "commerce-team" },
 * });
 *
 * const association = yield* AppRegistry.AttributeGroupAssociation("Assoc", {
 *   application: app.applicationId,
 *   attributeGroup: group.attributeGroupId,
 * });
 * ```
 *
 * @resource
 */
export declare const AttributeGroupAssociation: import("../../Resource.ts").ResourceClass<AttributeGroupAssociation>;
export declare const AttributeGroupAssociationProvider: () => import("effect/Layer").Layer<Provider.Provider<AttributeGroupAssociation>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=AttributeGroupAssociation.d.ts.map