import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface HttpNamespaceProps {
    /**
     * Name of the namespace. Changing the name replaces the namespace.
     * @default a generated DNS-compatible physical name
     */
    name?: string;
    /**
     * A description for the namespace.
     */
    description?: string;
    /**
     * Tags to apply to the namespace. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface HttpNamespace extends Resource<"AWS.CloudMap.HttpNamespace", HttpNamespaceProps, {
    /**
     * The unique identifier of the namespace.
     */
    namespaceId: string;
    /**
     * The ARN of the namespace.
     */
    namespaceArn: string;
    /**
     * Name of the namespace.
     */
    namespaceName: string;
    /**
     * The name clients use to discover instances via the HTTP discovery API.
     */
    httpName: string | undefined;
}, {}, Providers> {
}
/**
 * An AWS Cloud Map HTTP namespace — an API-only service registry. Instances
 * registered in an HTTP namespace are discoverable via the
 * `DiscoverInstances` API but not via DNS, so no VPC or hosted zone is
 * required.
 *
 * Namespace creation and deletion are asynchronous — the provider polls the
 * Cloud Map operations API (bounded) until they complete.
 * ### Creating Namespaces
 * **Example:** HTTP Namespace
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const namespace = yield* AWS.CloudMap.HttpNamespace("AppNamespace", {
 *   description: "API-only service discovery",
 * });
 * ```
 *
 * ### Registering Services
 * **Example:** API-only Service
 * ```typescript
 * const service = yield* AWS.CloudMap.Service("Backend", {
 *   namespaceId: namespace.namespaceId,
 * });
 * ```
 *
 * @resource
 */
export declare const HttpNamespace: import("../../Resource.ts").ResourceClass<HttpNamespace>;
export declare const HttpNamespaceProvider: () => import("effect/Layer").Layer<Provider.Provider<HttpNamespace>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=HttpNamespace.d.ts.map