import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/** The kind of third-party identity provider. */
export type IdentityProviderType = "SAML" | "OIDC" | "Facebook" | "Google" | "LoginWithAmazon" | "SignInWithApple";
export interface IdentityProviderProps {
    /**
     * The ID of the user pool the IdP is attached to. Changing this triggers
     * a replacement.
     */
    userPoolId: string;
    /**
     * The kind of identity provider. Changing this triggers a replacement.
     */
    providerType: IdentityProviderType;
    /**
     * Name of the identity provider (1-32 chars, no spaces). For social
     * providers the name must match the provider type (e.g. `Google`). If
     * omitted, a deterministic name is generated from the app, stage, and
     * logical ID. Changing this triggers a replacement.
     */
    providerName?: string;
    /**
     * Provider configuration. For OIDC: `client_id`, `client_secret`,
     * `authorize_scopes`, `oidc_issuer`, `attributes_request_method`. For
     * SAML: `MetadataURL` or `MetadataFile`. For social providers:
     * `client_id`, `client_secret`, `authorize_scopes`. Wrap secret values
     * (e.g. `client_secret`) with `Redacted.make(...)` so they never leak
     * into logs or state output.
     */
    providerDetails: Record<string, string | Redacted.Redacted<string>>;
    /**
     * Maps IdP claims to user pool attributes, e.g. `{ email: "email" }`.
     */
    attributeMapping?: Record<string, string>;
    /**
     * Identifiers (up to 50) that direct sign-in requests to this IdP.
     */
    idpIdentifiers?: string[];
}
export interface IdentityProvider extends Resource<"AWS.Cognito.IdentityProvider", IdentityProviderProps, {
    /** The name of the identity provider. */
    providerName: string;
    /** The ID of the user pool the IdP is attached to. */
    userPoolId: string;
    /** The kind of identity provider. */
    providerType: IdentityProviderType;
}, never, Providers> {
}
/**
 * A third-party identity provider (SAML, OIDC, or social) attached to an
 * Amazon Cognito user pool, enabling federated sign-in through managed
 * login.
 * ### Creating Identity Providers
 * **Example:** OIDC Provider
 * ```typescript
 * import * as Cognito from "alchemy/AWS/Cognito";
 *
 * const pool = yield* Cognito.UserPool("Users", {});
 * const oidc = yield* Cognito.IdentityProvider("Corporate", {
 *   userPoolId: pool.userPoolId,
 *   providerType: "OIDC",
 *   providerDetails: {
 *     client_id: "my-client-id",
 *     client_secret: Redacted.make("my-client-secret"),
 *     authorize_scopes: "openid email",
 *     oidc_issuer: "https://accounts.google.com",
 *     attributes_request_method: "GET",
 *   },
 *   attributeMapping: { email: "email", username: "sub" },
 * });
 * ```
 *
 * **Example:** Wire the IdP to an App Client
 * ```typescript
 * const client = yield* Cognito.UserPoolClient("Web", {
 *   userPoolId: pool.userPoolId,
 *   supportedIdentityProviders: ["COGNITO", oidc.providerName],
 * });
 * ```
 *
 * @resource
 */
export declare const IdentityProvider: import("../../Resource.ts").ResourceClass<IdentityProvider>;
export declare const IdentityProviderProvider: () => import("effect/Layer").Layer<Provider.Provider<IdentityProvider>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=IdentityProvider.d.ts.map