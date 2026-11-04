import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
declare const ResourceAssociationNotVisible_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ResourceAssociationNotVisible";
} & Readonly<A>;
/**
 * Raised when a freshly created resource association has not become visible
 * to `getAssociatedResource` within the bounded eventual-consistency window.
 */
export declare class ResourceAssociationNotVisible extends ResourceAssociationNotVisible_base<{
    readonly application: string;
    readonly resource: string;
}> {
}
export interface ResourceAssociationProps {
    /**
     * The application to associate the resource with: its ID, name, or ARN.
     * Changing it replaces the association.
     */
    application: string;
    /**
     * The type of resource being associated: `CFN_STACK` for a CloudFormation
     * stack or `RESOURCE_TAG_VALUE` for a tag-value query. Changing it replaces
     * the association.
     */
    resourceType: "CFN_STACK" | "RESOURCE_TAG_VALUE";
    /**
     * The name or ARN of the resource to associate (e.g. the CloudFormation
     * stack name). Changing it replaces the association.
     */
    resource: string;
    /**
     * Association options. `APPLY_APPLICATION_TAG` (the service default) stamps
     * the resource with the `awsApplication` tag; `SKIP_APPLICATION_TAG` leaves
     * the resource's tags untouched. Updatable in place (the association is
     * re-created under the hood).
     */
    options?: ("APPLY_APPLICATION_TAG" | "SKIP_APPLICATION_TAG")[];
}
export interface ResourceAssociation extends Resource<"AWS.AppRegistry.ResourceAssociation", ResourceAssociationProps, {
    /** The ID of the associated application. */
    applicationId: string;
    /** The ARN of the associated application. */
    applicationArn: string;
    /** The type of the associated resource. */
    resourceType: string;
    /** The canonical name of the associated resource. */
    resourceName: string;
    /** The ARN of the associated resource. */
    resourceArn: string;
}, never, Providers> {
}
/**
 * Associates an AWS resource (a CloudFormation stack or a tag-value query)
 * with an AppRegistry {@link Application} so the resource is inventoried
 * under the application in myApplications.
 *
 * ### Associating a Resource
 * **Example:** Associate a CloudFormation Stack
 * ```typescript
 * import * as AppRegistry from "alchemy/AWS/AppRegistry";
 * import * as CloudFormation from "alchemy/AWS/CloudFormation";
 *
 * const app = yield* AppRegistry.Application("Storefront", {});
 * const stack = yield* CloudFormation.Stack("Network", {
 *   templateBody: networkTemplateJson,
 * });
 *
 * const association = yield* AppRegistry.ResourceAssociation("StackAssoc", {
 *   application: app.applicationId,
 *   resourceType: "CFN_STACK",
 *   resource: stack.stackName,
 * });
 * ```
 *
 * **Example:** Associate Without Applying the Application Tag
 * ```typescript
 * const association = yield* AppRegistry.ResourceAssociation("StackAssoc", {
 *   application: app.applicationId,
 *   resourceType: "CFN_STACK",
 *   resource: stack.stackName,
 *   options: ["SKIP_APPLICATION_TAG"],
 * });
 * ```
 *
 * @resource
 */
export declare const ResourceAssociation: import("../../Resource.ts").ResourceClass<ResourceAssociation>;
export declare const ResourceAssociationProvider: () => import("effect/Layer").Layer<Provider.Provider<ResourceAssociation>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
export {};
//# sourceMappingURL=ResourceAssociation.d.ts.map