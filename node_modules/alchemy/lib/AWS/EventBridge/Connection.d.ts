import * as eventbridge from "@distilled.cloud/aws/eventbridge";
import type * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type { ConnectionAuthorizationType, ConnectionHttpParameters, ConnectionOAuthHttpMethod, ConnectionState, } from "@distilled.cloud/aws/eventbridge";
export type ConnectionName = string;
export type ConnectionArn = `arn:aws:events:${RegionID}:${AccountID}:connection/${ConnectionName}/${string}`;
export interface ConnectionApiKeyAuthParameters {
    /** Header name the API key is sent under (e.g. `x-api-key`). */
    apiKeyName: string;
    /** The API key value. Wrap with `Redacted.make(...)` — stored by EventBridge in Secrets Manager. */
    apiKeyValue: Redacted.Redacted<string>;
}
export interface ConnectionBasicAuthParameters {
    /** Username for HTTP Basic authorization. */
    username: string;
    /** Password for HTTP Basic authorization. Wrap with `Redacted.make(...)`. */
    password: Redacted.Redacted<string>;
}
export interface ConnectionOAuthClientParameters {
    /** OAuth client ID. */
    clientId: string;
    /** OAuth client secret. Wrap with `Redacted.make(...)`. */
    clientSecret: Redacted.Redacted<string>;
}
export interface ConnectionOAuthParameters {
    /** The client credentials exchanged for a token. */
    clientParameters: ConnectionOAuthClientParameters;
    /** URL of the OAuth authorization (token) endpoint. */
    authorizationEndpoint: string;
    /** HTTP method used against the authorization endpoint. */
    httpMethod: eventbridge.ConnectionOAuthHttpMethod;
    /** Additional parameters included in the token request. */
    oauthHttpParameters?: eventbridge.ConnectionHttpParameters;
}
export interface ConnectionAuthParameters {
    /** API-key authorization (`authorizationType: "API_KEY"`). */
    apiKeyAuthParameters?: ConnectionApiKeyAuthParameters;
    /** Basic authorization (`authorizationType: "BASIC"`). */
    basicAuthParameters?: ConnectionBasicAuthParameters;
    /** OAuth client-credentials authorization (`authorizationType: "OAUTH_CLIENT_CREDENTIALS"`). */
    oauthParameters?: ConnectionOAuthParameters;
    /** Additional header/query/body parameters included in every invocation. */
    invocationHttpParameters?: eventbridge.ConnectionHttpParameters;
}
export interface ConnectionProps {
    /**
     * Name of the connection. Must match [\.\-_A-Za-z0-9]+, 1-64 characters.
     * If omitted, a unique name will be generated.
     */
    name?: ConnectionName;
    /**
     * Description of the connection. Max 512 characters.
     */
    description?: string;
    /**
     * The type of authorization to use for the connection.
     */
    authorizationType: eventbridge.ConnectionAuthorizationType;
    /**
     * The authorization parameters matching `authorizationType`. Secret values
     * (`apiKeyValue`, `password`, `clientSecret`) are `Redacted` end-to-end and
     * stored by EventBridge in Secrets Manager.
     */
    authParameters: ConnectionAuthParameters;
    /**
     * The identifier of the KMS customer managed key to encrypt the connection
     * secret.
     */
    kmsKeyIdentifier?: string;
}
/**
 * An Amazon EventBridge connection holding the authorization used to invoke
 * an HTTP endpoint through an {@link ApiDestination}. EventBridge stores the
 * secret half of the connection in Secrets Manager on your behalf.
 *
 * Connections do not support tags, so ownership is tracked by the
 * deterministic physical name.
 * ### Connecting to APIs
 * **Example:** API-Key Connection
 * ```typescript
 * import * as Redacted from "effect/Redacted";
 *
 * const connection = yield* AWS.EventBridge.Connection("PartnerApi", {
 *   authorizationType: "API_KEY",
 *   authParameters: {
 *     apiKeyAuthParameters: {
 *       apiKeyName: "x-api-key",
 *       apiKeyValue: Redacted.make(process.env.PARTNER_API_KEY!),
 *     },
 *   },
 * });
 * ```
 *
 * **Example:** OAuth Client-Credentials Connection
 * ```typescript
 * const connection = yield* AWS.EventBridge.Connection("OAuthApi", {
 *   authorizationType: "OAUTH_CLIENT_CREDENTIALS",
 *   authParameters: {
 *     oauthParameters: {
 *       clientParameters: {
 *         clientId: "my-client",
 *         clientSecret: Redacted.make(process.env.OAUTH_SECRET!),
 *       },
 *       authorizationEndpoint: "https://auth.example.com/oauth/token",
 *       httpMethod: "POST",
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export interface Connection extends Resource<"AWS.EventBridge.Connection", ConnectionProps, {
    /** The name of the connection. */
    connectionName: ConnectionName;
    /** The ARN of the connection. */
    connectionArn: ConnectionArn;
    /** The state of the connection (e.g. `AUTHORIZED`). */
    connectionState: eventbridge.ConnectionState;
    /** ARN of the Secrets Manager secret EventBridge created for the connection. */
    secretArn?: string;
}, never, Providers> {
}
export declare const Connection: import("../../Resource.ts").ResourceClass<Connection>;
export declare const ConnectionProvider: () => import("effect/Layer").Layer<Provider.Provider<Connection>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Connection.d.ts.map