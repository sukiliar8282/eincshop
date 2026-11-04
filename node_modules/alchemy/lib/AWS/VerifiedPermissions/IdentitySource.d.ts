import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * Identity-source configuration backed by an Amazon Cognito user pool.
 */
export interface CognitoUserPoolConfiguration {
    /**
     * ARN of the Cognito user pool whose identities should be usable as
     * principals in authorization requests.
     */
    userPoolArn: string;
    /**
     * The user pool app client IDs to accept tokens from. When omitted, tokens
     * from any of the pool's app clients are accepted.
     */
    clientIds?: string[];
    /**
     * The Cedar entity type to map Cognito groups to (e.g.
     * `PhotoApp::UserGroup`). Enables group claims in policies.
     */
    groupEntityType?: string;
}
/**
 * Identity-source configuration backed by a generic OpenID Connect (OIDC)
 * identity provider.
 */
export interface OpenIdConnectConfiguration {
    /**
     * The issuer URL of the OIDC provider, e.g. `https://accounts.google.com`.
     * Verified Permissions fetches `/.well-known/openid-configuration` from
     * this URL at creation time.
     */
    issuer: string;
    /**
     * A prefix prepended to the user ID taken from the token, producing entity
     * IDs like `MyOIDCProvider|user-id`.
     */
    entityIdPrefix?: string;
    /**
     * Map a token group claim onto a Cedar entity type so policies can match
     * on group membership.
     */
    groupConfiguration?: {
        /** The token claim that lists the user's groups, e.g. `groups`. */
        groupClaim: string;
        /** The Cedar entity type groups map to, e.g. `PhotoApp::UserGroup`. */
        groupEntityType: string;
    };
    /**
     * Which token type the identity source consumes — exactly one of
     * `accessTokenOnly` or `identityTokenOnly`.
     */
    tokenSelection: {
        /** Consume OIDC access tokens. */
        accessTokenOnly: {
            /** The claim to derive the principal entity ID from. @default "sub" */
            principalIdClaim?: string;
            /** The `aud` values to accept tokens for. */
            audiences?: string[];
        };
        identityTokenOnly?: never;
    } | {
        accessTokenOnly?: never;
        /** Consume OIDC identity (ID) tokens. */
        identityTokenOnly: {
            /** The claim to derive the principal entity ID from. @default "sub" */
            principalIdClaim?: string;
            /** The client IDs (`aud`) to accept tokens for. */
            clientIds?: string[];
        };
    };
}
/**
 * Exactly one of a Cognito user pool or an OIDC provider configuration.
 */
export type IdentitySourceConfiguration = {
    /** Use an Amazon Cognito user pool as the identity provider. */
    cognito: CognitoUserPoolConfiguration;
    openIdConnect?: never;
} | {
    cognito?: never;
    /** Use a generic OpenID Connect provider as the identity provider. */
    openIdConnect: OpenIdConnectConfiguration;
};
export type IdentitySourceProps = IdentitySourceConfiguration & {
    /**
     * The ID of the policy store the identity source belongs to. Changing the
     * store replaces the identity source.
     */
    policyStoreId: string;
    /**
     * The Cedar entity type that tokens from this identity source map to, e.g.
     * `PhotoApp::User`. Mutable via `UpdateIdentitySource`.
     */
    principalEntityType?: string;
};
export interface IdentitySource extends Resource<"AWS.VerifiedPermissions.IdentitySource", IdentitySourceProps, {
    /**
     * ID of the policy store the identity source belongs to.
     */
    policyStoreId: string;
    /**
     * Service-assigned unique ID of the identity source within the store.
     */
    identitySourceId: string;
}, {}, Providers> {
}
/**
 * An identity source connects a Verified Permissions policy store to an
 * identity provider — an Amazon Cognito user pool or any OpenID Connect
 * (OIDC) IdP — so that `IsAuthorizedWithToken` and
 * `BatchIsAuthorizedWithToken` can derive the principal directly from a JWT.
 * ### Connecting an Identity Provider
 * **Example:** Cognito User Pool
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const store = yield* AWS.VerifiedPermissions.PolicyStore("Store", {});
 *
 * yield* AWS.VerifiedPermissions.IdentitySource("Users", {
 *   policyStoreId: store.policyStoreId,
 *   principalEntityType: "PhotoApp::User",
 *   cognito: {
 *     userPoolArn: userPool.userPoolArn,
 *   },
 * });
 * ```
 *
 * **Example:** OpenID Connect Provider
 * ```typescript
 * yield* AWS.VerifiedPermissions.IdentitySource("Oidc", {
 *   policyStoreId: store.policyStoreId,
 *   principalEntityType: "PhotoApp::User",
 *   openIdConnect: {
 *     issuer: "https://accounts.google.com",
 *     tokenSelection: {
 *       identityTokenOnly: { clientIds: ["my-oauth-client-id"] },
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const IdentitySource: import("../../Resource.ts").ResourceClass<IdentitySource>;
export declare const IdentitySourceProvider: () => import("effect/Layer").Layer<Provider.Provider<IdentitySource>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=IdentitySource.d.ts.map