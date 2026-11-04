import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/** A Cognito user pool provider entry for an identity pool. */
export interface IdentityPoolCognitoProvider {
    /**
     * The user pool provider name:
     * `cognito-idp.<region>.amazonaws.com/<userPoolId>`.
     */
    providerName: string;
    /** The app client ID allowed to exchange tokens. */
    clientId: string;
    /**
     * Whether Cognito checks with the user pool that the token was not
     * globally signed out.
     * @default false
     */
    serverSideTokenCheck?: boolean;
}
export interface IdentityPoolProps {
    /**
     * Name of the identity pool. If omitted, a deterministic physical name is
     * generated from the app, stage, and logical ID. Mutable in place.
     */
    identityPoolName?: string;
    /**
     * Whether the pool vends credentials to unauthenticated (guest)
     * identities.
     * @default false
     */
    allowUnauthenticatedIdentities?: boolean;
    /**
     * Enables the legacy basic (classic) credentials flow.
     * @default false
     */
    allowClassicFlow?: boolean;
    /**
     * Social login providers keyed by their domain, e.g.
     * `{ "accounts.google.com": "<client-id>" }`.
     */
    supportedLoginProviders?: Record<string, string>;
    /**
     * Domain for developer-authenticated identities. Letters, digits, periods,
     * underscores, and dashes.
     */
    developerProviderName?: string;
    /**
     * ARNs of IAM OpenID Connect providers this pool trusts.
     */
    openIdConnectProviderArns?: string[];
    /**
     * Cognito user pools this identity pool federates.
     */
    cognitoIdentityProviders?: IdentityPoolCognitoProvider[];
    /**
     * ARNs of IAM SAML providers this pool trusts.
     */
    samlProviderArns?: string[];
    /**
     * Tags to apply to the identity pool. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface IdentityPool extends Resource<"AWS.Cognito.IdentityPool", IdentityPoolProps, {
    /** The generated identity pool ID, e.g. `us-west-2:xxxx-...`. */
    identityPoolId: string;
    /** The ARN of the identity pool. */
    identityPoolArn: string;
    /** The name of the identity pool. */
    identityPoolName: string;
}, never, Providers> {
}
/**
 * An Amazon Cognito identity pool (federated identities) — exchanges tokens
 * from user pools, social providers, OIDC/SAML IdPs, or developer backends
 * for temporary AWS credentials.
 * ### Creating an Identity Pool
 * **Example:** Identity Pool Federating a User Pool
 * ```typescript
 * import * as Cognito from "alchemy/AWS/Cognito";
 * import * as Output from "alchemy/Output";
 *
 * const pool = yield* Cognito.UserPool("Users", {});
 * const client = yield* Cognito.UserPoolClient("Web", {
 *   userPoolId: pool.userPoolId,
 * });
 * const identities = yield* Cognito.IdentityPool("Identities", {
 *   cognitoIdentityProviders: [
 *     {
 *       providerName: Output.interpolate`cognito-idp.us-west-2.amazonaws.com/${pool.userPoolId}`,
 *       clientId: client.clientId,
 *     },
 *   ],
 * });
 * ```
 *
 * **Example:** Guest (Unauthenticated) Access
 * ```typescript
 * const identities = yield* Cognito.IdentityPool("Identities", {
 *   allowUnauthenticatedIdentities: true,
 * });
 * ```
 *
 * ### Roles
 * **Example:** Attach Authenticated/Unauthenticated Roles
 * ```typescript
 * yield* Cognito.IdentityPoolRoleAttachment("Roles", {
 *   identityPoolId: identities.identityPoolId,
 *   roles: { authenticated: role.roleArn },
 * });
 * ```
 *
 * @resource
 */
export declare const IdentityPool: import("../../Resource.ts").ResourceClass<IdentityPool>;
export declare const IdentityPoolProvider: () => import("effect/Layer").Layer<Provider.Provider<IdentityPool>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=IdentityPool.d.ts.map