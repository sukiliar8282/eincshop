import type * as Duration from "effect/Duration";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * The authentication flows an app client is allowed to use.
 */
export type ExplicitAuthFlow = "ALLOW_USER_PASSWORD_AUTH" | "ALLOW_ADMIN_USER_PASSWORD_AUTH" | "ALLOW_USER_SRP_AUTH" | "ALLOW_USER_AUTH" | "ALLOW_CUSTOM_AUTH" | "ALLOW_REFRESH_TOKEN_AUTH";
/** Units for the token validity durations. */
export type TokenValidityUnit = "seconds" | "minutes" | "hours" | "days";
export interface UserPoolClientProps {
    /**
     * The ID of the user pool the client belongs to. Changing this triggers a
     * replacement.
     */
    userPoolId: string;
    /**
     * Name of the app client. If omitted, a deterministic physical name is
     * generated from the app, stage, and logical ID.
     */
    clientName?: string;
    /**
     * Whether to generate a client secret. Confidential (server-side) clients
     * should use a secret; public (browser/mobile) clients must not.
     * Changing this triggers a replacement.
     * @default false
     */
    generateSecret?: boolean;
    /**
     * The authentication flows this client may use, e.g.
     * `ALLOW_USER_PASSWORD_AUTH` for direct username/password sign-in or
     * `ALLOW_USER_SRP_AUTH` for the SRP protocol.
     * @default ALLOW_USER_SRP_AUTH, ALLOW_CUSTOM_AUTH, ALLOW_REFRESH_TOKEN_AUTH
     */
    explicitAuthFlows?: ExplicitAuthFlow[];
    /**
     * Refresh token validity (in `tokenValidityUnits.refreshToken`, default days).
     * @default 30 days
     */
    refreshTokenValidity?: number;
    /**
     * Access token validity (in `tokenValidityUnits.accessToken`, default hours).
     * @default 1 hour
     */
    accessTokenValidity?: number;
    /**
     * ID token validity (in `tokenValidityUnits.idToken`, default hours).
     * @default 1 hour
     */
    idTokenValidity?: number;
    /**
     * Units for the three token validity numbers.
     */
    tokenValidityUnits?: {
        accessToken?: TokenValidityUnit;
        idToken?: TokenValidityUnit;
        refreshToken?: TokenValidityUnit;
    };
    /**
     * User attributes this client may read.
     */
    readAttributes?: string[];
    /**
     * User attributes this client may write.
     */
    writeAttributes?: string[];
    /**
     * Identity providers this client supports, e.g. `COGNITO` or the names of
     * configured `IdentityProvider`s.
     */
    supportedIdentityProviders?: string[];
    /**
     * Allowed OAuth callback (redirect) URLs.
     */
    callbackUrls?: string[];
    /**
     * Allowed OAuth sign-out URLs.
     */
    logoutUrls?: string[];
    /**
     * Default redirect URI; must be listed in `callbackUrls`.
     */
    defaultRedirectUri?: string;
    /**
     * Allowed OAuth flows (`code`, `implicit`, `client_credentials`).
     */
    allowedOAuthFlows?: ("code" | "implicit" | "client_credentials")[];
    /**
     * Allowed OAuth scopes, e.g. `openid`, `email`, or resource-server scopes.
     */
    allowedOAuthScopes?: string[];
    /**
     * Must be `true` for the OAuth settings above to take effect.
     * @default false
     */
    allowedOAuthFlowsUserPoolClient?: boolean;
    /**
     * `ENABLED` returns a generic error for sign-in attempts against
     * non-existent users (prevents user enumeration); `LEGACY` returns the
     * original errors.
     * @default "ENABLED"
     */
    preventUserExistenceErrors?: "ENABLED" | "LEGACY";
    /**
     * Whether issued tokens can be revoked with `RevokeToken`.
     * @default true
     */
    enableTokenRevocation?: boolean;
    /**
     * Duration of the session token in auth challenge flows, e.g.
     * `"5 minutes"` (3-15 minutes). Rounded to whole minutes on the wire.
     * @default 3 minutes
     */
    authSessionValidity?: Duration.Input;
}
export interface UserPoolClient extends Resource<"AWS.Cognito.UserPoolClient", UserPoolClientProps, {
    /** The generated app client ID. */
    clientId: string;
    /** The client secret; defined only when `generateSecret` is true. */
    clientSecret: Redacted.Redacted<string> | undefined;
    /** The name of the app client. */
    clientName: string;
    /** The ID of the user pool the client belongs to. */
    userPoolId: string;
}, never, Providers> {
}
/**
 * An app client of an Amazon Cognito user pool. Applications authenticate
 * against the pool through a client, which controls the allowed auth flows,
 * token lifetimes, and OAuth settings.
 * ### Creating an App Client
 * **Example:** Public Client with Password Auth
 * ```typescript
 * import * as Cognito from "alchemy/AWS/Cognito";
 *
 * const pool = yield* Cognito.UserPool("Users", {});
 * const client = yield* Cognito.UserPoolClient("Web", {
 *   userPoolId: pool.userPoolId,
 *   explicitAuthFlows: ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"],
 * });
 * ```
 *
 * **Example:** Confidential Client with a Secret
 * ```typescript
 * const server = yield* Cognito.UserPoolClient("Server", {
 *   userPoolId: pool.userPoolId,
 *   generateSecret: true,
 *   explicitAuthFlows: ["ALLOW_ADMIN_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"],
 * });
 * ```
 *
 * ### Token Configuration
 * **Example:** Short-Lived Access Tokens
 * ```typescript
 * const client = yield* Cognito.UserPoolClient("Web", {
 *   userPoolId: pool.userPoolId,
 *   accessTokenValidity: 30,
 *   idTokenValidity: 30,
 *   refreshTokenValidity: 7,
 *   tokenValidityUnits: {
 *     accessToken: "minutes",
 *     idToken: "minutes",
 *     refreshToken: "days",
 *   },
 * });
 * ```
 *
 * ### OAuth
 * **Example:** Authorization Code Flow
 * ```typescript
 * const client = yield* Cognito.UserPoolClient("Web", {
 *   userPoolId: pool.userPoolId,
 *   allowedOAuthFlowsUserPoolClient: true,
 *   allowedOAuthFlows: ["code"],
 *   allowedOAuthScopes: ["openid", "email"],
 *   callbackUrls: ["https://example.com/callback"],
 *   supportedIdentityProviders: ["COGNITO"],
 * });
 * ```
 *
 * @resource
 */
export declare const UserPoolClient: import("../../Resource.ts").ResourceClass<UserPoolClient>;
export declare const UserPoolClientProvider: () => import("effect/Layer").Layer<Provider.Provider<UserPoolClient>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=UserPoolClient.d.ts.map