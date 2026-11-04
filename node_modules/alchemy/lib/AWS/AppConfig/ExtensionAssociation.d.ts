import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface ExtensionAssociationProps {
    /**
     * The extension to associate: its ID, name, or ARN. Changing it replaces
     * the association.
     */
    extensionIdentifier: string;
    /**
     * The version of the extension to pin. If omitted, AppConfig uses the
     * latest version. Changing it replaces the association.
     */
    extensionVersionNumber?: number;
    /**
     * ARN of the AppConfig resource the extension attaches to: an application,
     * environment, or configuration profile. Changing it replaces the
     * association.
     */
    resourceIdentifier: string;
    /**
     * Values for the parameters declared by the extension, keyed by parameter
     * name.
     */
    parameters?: Record<string, string>;
    /**
     * User-defined tags for the extension association.
     */
    tags?: Record<string, string>;
}
export interface ExtensionAssociation extends Resource<"AWS.AppConfig.ExtensionAssociation", ExtensionAssociationProps, {
    extensionAssociationId: string;
    extensionAssociationArn: string;
    extensionArn: string;
    resourceArn: string;
}, never, Providers> {
}
/**
 * An AWS AppConfig extension association — attaches an {@link Extension} to an
 * application, environment, or configuration profile so the extension's
 * actions fire for that resource's workflow events.
 *
 * ### Associating an Extension
 * **Example:** Attach an Extension to an Application
 * ```typescript
 * const association = yield* AppConfig.ExtensionAssociation("Hook", {
 *   extensionIdentifier: extension.extensionId,
 *   resourceIdentifier: app.applicationArn,
 * });
 * ```
 *
 * **Example:** Attach with Parameter Values
 * ```typescript
 * const association = yield* AppConfig.ExtensionAssociation("Hook", {
 *   extensionIdentifier: extension.extensionId,
 *   resourceIdentifier: env.environmentArn,
 *   parameters: { topicArn: topic.topicArn },
 * });
 * ```
 *
 * @resource
 */
export declare const ExtensionAssociation: import("../../Resource.ts").ResourceClass<ExtensionAssociation>;
export declare const ExtensionAssociationProvider: () => import("effect/Layer").Layer<Provider.Provider<ExtensionAssociation>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ExtensionAssociation.d.ts.map