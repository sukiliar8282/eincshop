import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/** An OAuth scope defined by a resource server. */
export interface ResourceServerScope {
    /** Scope name; clients request it as `<identifier>/<scopeName>`. */
    scopeName: string;
    /** Human-readable description of the scope. */
    scopeDescription: string;
}
export interface ResourceServerProps {
    /**
     * The ID of the user pool the resource server belongs to. Changing this
     * triggers a replacement.
     */
    userPoolId: string;
    /**
     * Unique identifier of the resource server — conventionally an API URL
     * like `https://api.example.com`. If omitted, a deterministic identifier
     * is generated from the app, stage, and logical ID. Changing this
     * triggers a replacement.
     */
    identifier?: string;
    /**
     * Friendly name of the resource server. Defaults to the identifier.
     */
    name?: string;
    /**
     * OAuth scopes (up to 100) exposed by this resource server. Clients
     * reference them as `<identifier>/<scopeName>` in `allowedOAuthScopes`.
     */
    scopes?: ResourceServerScope[];
}
export interface ResourceServer extends Resource<"AWS.Cognito.ResourceServer", ResourceServerProps, {
    /** The unique identifier of the resource server. */
    identifier: string;
    /** The ID of the user pool the resource server belongs to. */
    userPoolId: string;
    /** The friendly name of the resource server. */
    name: string;
}, never, Providers> {
}
/**
 * An OAuth 2.0 resource server for an Amazon Cognito user pool. Resource
 * servers declare custom scopes that app clients can request in
 * `client_credentials` and authorization-code flows.
 * ### Creating a Resource Server
 * **Example:** API with Custom Scopes
 * ```typescript
 * import * as Cognito from "alchemy/AWS/Cognito";
 *
 * const pool = yield* Cognito.UserPool("Users", {});
 * const api = yield* Cognito.ResourceServer("Api", {
 *   userPoolId: pool.userPoolId,
 *   identifier: "https://api.example.com",
 *   scopes: [
 *     { scopeName: "read", scopeDescription: "Read access" },
 *     { scopeName: "write", scopeDescription: "Write access" },
 *   ],
 * });
 * ```
 *
 * **Example:** Client Requesting Resource-Server Scopes
 * ```typescript
 * const client = yield* Cognito.UserPoolClient("Machine", {
 *   userPoolId: pool.userPoolId,
 *   generateSecret: true,
 *   allowedOAuthFlowsUserPoolClient: true,
 *   allowedOAuthFlows: ["client_credentials"],
 *   allowedOAuthScopes: ["https://api.example.com/read"],
 * });
 * ```
 *
 * @resource
 */
export declare const ResourceServer: import("../../Resource.ts").ResourceClass<ResourceServer>;
export declare const ResourceServerProvider: () => import("effect/Layer").Layer<Provider.Provider<ResourceServer>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ResourceServer.d.ts.map