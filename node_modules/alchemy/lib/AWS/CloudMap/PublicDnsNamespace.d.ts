import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface PublicDnsNamespaceProps {
    /**
     * Name of the namespace — must be a domain name you intend to serve
     * publicly (a Route 53 public hosted zone is created for it). Changing the
     * name replaces the namespace.
     * @default a generated DNS-compatible physical name
     */
    name?: string;
    /**
     * A description for the namespace.
     */
    description?: string;
    /**
     * The TTL of the SOA record for the namespace's Route 53 public hosted
     * zone (e.g. `"60 seconds"` or `Duration.seconds(60)`; a bare number is
     * milliseconds).
     */
    ttl?: Duration.Input;
    /**
     * Tags to apply to the namespace. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface PublicDnsNamespace extends Resource<"AWS.CloudMap.PublicDnsNamespace", PublicDnsNamespaceProps, {
    /**
     * The unique identifier of the namespace.
     */
    namespaceId: string;
    /**
     * The ARN of the namespace.
     */
    namespaceArn: string;
    /**
     * Name of the namespace (the public DNS domain).
     */
    namespaceName: string;
    /**
     * The public Route 53 hosted zone Cloud Map created for the namespace.
     */
    hostedZoneId: string | undefined;
}, {}, Providers> {
}
/**
 * An AWS Cloud Map public DNS namespace — a service registry backed by a
 * Route 53 **public** hosted zone, so registered instances are discoverable
 * on the public internet via DNS as well as via the `DiscoverInstances` API.
 *
 * The hosted zone incurs standard Route 53 charges while the namespace
 * exists, and the namespace name is only useful if you control the domain.
 *
 * Namespace creation and deletion are asynchronous — the provider polls the
 * Cloud Map operations API (bounded) until they complete.
 * ### Creating Namespaces
 * **Example:** Public DNS Namespace
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const namespace = yield* AWS.CloudMap.PublicDnsNamespace("PublicNamespace", {
 *   name: "discovery.example.com",
 * });
 * ```
 *
 * @resource
 */
export declare const PublicDnsNamespace: import("../../Resource.ts").ResourceClass<PublicDnsNamespace>;
export declare const PublicDnsNamespaceProvider: () => import("effect/Layer").Layer<Provider.Provider<PublicDnsNamespace>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=PublicDnsNamespace.d.ts.map