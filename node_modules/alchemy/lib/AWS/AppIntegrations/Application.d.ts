import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ApplicationProps {
    /**
     * Name of the application. If omitted, a unique name is generated from
     * the app, stage, and logical ID. The name can be updated in place.
     */
    name?: string;
    /**
     * The unique namespace of the application, e.g. `com.example.myapp`.
     * Changing the namespace replaces the application.
     */
    namespace: string;
    /**
     * Description of the application (1-1000 characters).
     */
    description?: string;
    /**
     * The URL where the application is hosted and rendered from, e.g.
     * `https://example.com`.
     */
    accessUrl: string;
    /**
     * Additional origins the application is allowed to be loaded from.
     */
    approvedOrigins?: string[];
    /**
     * The configuration of events or requests that the application has access
     * to, e.g. `["User.Details.View"]`.
     */
    permissions?: string[];
    /**
     * Tags to apply to the application. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Application extends Resource<"AWS.AppIntegrations.Application", ApplicationProps, {
    applicationId: string;
    applicationArn: string;
    applicationName: string;
    namespace: string;
}, never, Providers> {
}
/**
 * An Amazon AppIntegrations application. Applications register external
 * (iframe-hosted) apps — most commonly Amazon Connect agent workspace
 * third-party applications — with a name, namespace, and the URL they are
 * served from.
 *
 * The namespace is immutable; changing it replaces the application. The
 * name, description, access URL, approved origins, and permissions can all
 * be updated in place.
 * ### Creating an Application
 * **Example:** Basic Application
 * ```typescript
 * import * as AppIntegrations from "alchemy/AWS/AppIntegrations";
 *
 * const app = yield* AppIntegrations.Application("AgentApp", {
 *   namespace: "com.example.agentapp",
 *   accessUrl: "https://example.com",
 * });
 * ```
 *
 * **Example:** Application with Permissions and Tags
 * ```typescript
 * const app = yield* AppIntegrations.Application("AgentApp", {
 *   namespace: "com.example.agentapp",
 *   accessUrl: "https://example.com",
 *   description: "Agent workspace application",
 *   permissions: ["User.Details.View"],
 *   tags: { team: "contact-center" },
 * });
 * ```
 *
 * @resource
 */
export declare const Application: import("../../Resource.ts").ResourceClass<Application>;
declare const ApplicationIncomplete_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "AppIntegrationsApplicationIncomplete";
} & Readonly<A>;
/**
 * Raised when the AppIntegrations API returns an application without the
 * fields required to build the resource attributes.
 */
export declare class ApplicationIncomplete extends ApplicationIncomplete_base<{
    message: string;
}> {
}
export declare const ApplicationProvider: () => import("effect/Layer").Layer<Provider.Provider<Application>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Application.d.ts.map