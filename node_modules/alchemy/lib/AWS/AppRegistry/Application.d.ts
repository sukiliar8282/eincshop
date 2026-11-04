import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ApplicationProps {
    /**
     * Name of the application. Must be unique in the account and region and
     * may only contain letters, numbers, dots, dashes, and underscores.
     * If omitted, a unique name is generated. Changing it replaces the
     * application.
     */
    applicationName?: string;
    /**
     * Description of the application. Updatable in place.
     */
    description?: string;
    /**
     * Tags to apply to the application. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Application extends Resource<"AWS.AppRegistry.Application", ApplicationProps, {
    /** The auto-generated application ID. */
    applicationId: string;
    /** The ARN of the application. */
    applicationArn: string;
    /** The name of the application. */
    applicationName: string;
}, never, Providers> {
}
/**
 * An AWS Service Catalog AppRegistry application — the top-level node that
 * groups related cloud resources and metadata under a single logical
 * application (surfaced in myApplications and the `awsApplication` tag).
 *
 * ### Creating an Application
 * **Example:** Basic Application
 * ```typescript
 * import * as AppRegistry from "alchemy/AWS/AppRegistry";
 *
 * const app = yield* AppRegistry.Application("Storefront", {});
 * ```
 *
 * **Example:** Application with Description and Tags
 * ```typescript
 * const app = yield* AppRegistry.Application("Storefront", {
 *   applicationName: "storefront",
 *   description: "Customer-facing storefront services",
 *   tags: { team: "commerce" },
 * });
 * ```
 *
 * @resource
 */
export declare const Application: import("../../Resource.ts").ResourceClass<Application>;
export declare const ApplicationProvider: () => import("effect/Layer").Layer<Provider.Provider<Application>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Application.d.ts.map