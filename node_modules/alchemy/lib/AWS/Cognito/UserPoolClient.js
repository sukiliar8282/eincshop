import * as cip from "@distilled.cloud/aws/cognito-identity-provider";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { toWireMinutes } from "../../Util/Duration.js";
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
export const UserPoolClient = Resource("AWS.Cognito.UserPoolClient");
const plain = (value) => value === undefined
    ? undefined
    : typeof value === "string"
        ? value
        : Redacted.value(value);
/** The mutable desired state, in wire shape — used both as the update body
 * and (against the observed client) for drift detection. */
const desiredConfig = (news) => ({
    ExplicitAuthFlows: news.explicitAuthFlows,
    RefreshTokenValidity: news.refreshTokenValidity,
    AccessTokenValidity: news.accessTokenValidity,
    IdTokenValidity: news.idTokenValidity,
    TokenValidityUnits: news.tokenValidityUnits === undefined
        ? undefined
        : {
            AccessToken: news.tokenValidityUnits.accessToken,
            IdToken: news.tokenValidityUnits.idToken,
            RefreshToken: news.tokenValidityUnits.refreshToken,
        },
    ReadAttributes: news.readAttributes,
    WriteAttributes: news.writeAttributes,
    SupportedIdentityProviders: news.supportedIdentityProviders,
    CallbackURLs: news.callbackUrls,
    LogoutURLs: news.logoutUrls,
    DefaultRedirectURI: news.defaultRedirectUri,
    AllowedOAuthFlows: news.allowedOAuthFlows,
    AllowedOAuthScopes: news.allowedOAuthScopes,
    AllowedOAuthFlowsUserPoolClient: news.allowedOAuthFlowsUserPoolClient,
    PreventUserExistenceErrors: news.preventUserExistenceErrors,
    EnableTokenRevocation: news.enableTokenRevocation,
    // The Cognito wire unit for AuthSessionValidity is whole minutes.
    AuthSessionValidity: toWireMinutes(news.authSessionValidity),
});
/** True when any prop the user specified differs from the observed client.
 * Unspecified props are "don't care". */
const hasDrift = (news, clientName, observed) => {
    if (observed.ClientName !== clientName)
        return true;
    const desired = desiredConfig(news);
    const observedSubset = {
        ExplicitAuthFlows: [...(observed.ExplicitAuthFlows ?? [])].sort(),
        RefreshTokenValidity: observed.RefreshTokenValidity,
        AccessTokenValidity: observed.AccessTokenValidity,
        IdTokenValidity: observed.IdTokenValidity,
        TokenValidityUnits: {
            AccessToken: observed.TokenValidityUnits?.AccessToken,
            IdToken: observed.TokenValidityUnits?.IdToken,
            RefreshToken: observed.TokenValidityUnits?.RefreshToken,
        },
        ReadAttributes: [...(observed.ReadAttributes ?? [])].sort(),
        WriteAttributes: [...(observed.WriteAttributes ?? [])].sort(),
        SupportedIdentityProviders: [
            ...(observed.SupportedIdentityProviders ?? []),
        ].sort(),
        CallbackURLs: [...(observed.CallbackURLs ?? [])].sort(),
        LogoutURLs: [...(observed.LogoutURLs ?? [])].sort(),
        DefaultRedirectURI: observed.DefaultRedirectURI,
        AllowedOAuthFlows: [...(observed.AllowedOAuthFlows ?? [])].sort(),
        AllowedOAuthScopes: [...(observed.AllowedOAuthScopes ?? [])].sort(),
        AllowedOAuthFlowsUserPoolClient: observed.AllowedOAuthFlowsUserPoolClient,
        PreventUserExistenceErrors: observed.PreventUserExistenceErrors,
        EnableTokenRevocation: observed.EnableTokenRevocation,
        AuthSessionValidity: observed.AuthSessionValidity,
    };
    for (const [key, desiredValue] of Object.entries(desired)) {
        if (desiredValue === undefined)
            continue;
        const observedValue = observedSubset[key];
        const normalizedDesired = Array.isArray(desiredValue)
            ? [...desiredValue].sort()
            : desiredValue;
        if (JSON.stringify(normalizedDesired) !== JSON.stringify(observedValue)) {
            return true;
        }
    }
    return false;
};
export const UserPoolClientProvider = () => Provider.effect(UserPoolClient, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.clientName ??
            (yield* createPhysicalName({ id, maxLength: 128 })));
    });
    const describeClient = Effect.fn(function* (userPoolId, clientId) {
        return yield* cip
            .describeUserPoolClient({
            UserPoolId: userPoolId,
            ClientId: clientId,
        })
            .pipe(Effect.map((r) => r.UserPoolClient), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    /** Find a client of the pool by exact name (used when state was lost).
     * The physical name embeds app/stage/id, so a match is ours. */
    const findClientByName = Effect.fn(function* (userPoolId, clientName) {
        const pages = yield* cip.listUserPoolClients
            .pages({ UserPoolId: userPoolId, MaxResults: 60 })
            .pipe(Stream.runCollect, Effect.catchTag("ResourceNotFoundException", () => Effect.succeed([])));
        const match = Array.from(pages)
            .flatMap((page) => page.UserPoolClients ?? [])
            .find((client) => client.ClientName === clientName);
        if (match?.ClientId === undefined)
            return undefined;
        return yield* describeClient(userPoolId, plain(match.ClientId));
    });
    const attributesOf = (client) => {
        const secret = plain(client.ClientSecret);
        return {
            clientId: plain(client.ClientId),
            clientSecret: secret === undefined ? undefined : Redacted.make(secret),
            clientName: client.ClientName,
            userPoolId: client.UserPoolId,
        };
    };
    return UserPoolClient.Provider.of({
        stables: ["clientId", "userPoolId"],
        // Sub-resource keyed entirely by its user pool (userPoolId) with no
        // global enumeration API of its own — nuke reaches it through the
        // parent pool's deletion, so enumeration returns empty per the
        // ProviderService doctrine.
        list: () => Effect.succeed([]),
        read: Effect.fn(function* ({ id, olds, output }) {
            const userPoolId = output?.userPoolId ?? olds?.userPoolId;
            if (userPoolId === undefined)
                return undefined;
            const observed = output?.clientId !== undefined
                ? yield* describeClient(userPoolId, output.clientId)
                : yield* findClientByName(userPoolId, yield* createName(id, olds ?? {}));
            return observed === undefined ? undefined : attributesOf(observed);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            if ((olds?.generateSecret ?? false) !== (news?.generateSecret ?? false)) {
                return { action: "replace" };
            }
            if (olds?.userPoolId !== news?.userPoolId) {
                return { action: "replace" };
            }
            const oldName = yield* createName(id, olds ?? {});
            const newName = yield* createName(id, news ?? {});
            if (oldName !== newName) {
                // ClientName is mutable via UpdateUserPoolClient — fall through
                // to the default update path.
                return undefined;
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const clientName = output?.clientName ?? (yield* createName(id, news));
            const userPoolId = news.userPoolId;
            // 1. OBSERVE — output.clientId is only a cache.
            let observed = output?.clientId !== undefined
                ? yield* describeClient(userPoolId, output.clientId)
                : undefined;
            if (observed === undefined) {
                observed = yield* findClientByName(userPoolId, clientName);
            }
            // 2. ENSURE — create when missing.
            if (observed === undefined) {
                observed = yield* cip
                    .createUserPoolClient({
                    UserPoolId: userPoolId,
                    ClientName: clientName,
                    GenerateSecret: news.generateSecret,
                    ...desiredConfig(news),
                })
                    .pipe(Effect.map((r) => r.UserPoolClient));
            }
            else if (hasDrift(news, clientName, observed)) {
                // 3. SYNC — UpdateUserPoolClient resets omitted fields to
                //    defaults, so the body is the full desired state; skip the
                //    call when nothing drifted.
                observed = yield* cip
                    .updateUserPoolClient({
                    UserPoolId: userPoolId,
                    ClientId: plain(observed.ClientId),
                    ClientName: clientName,
                    ...desiredConfig(news),
                })
                    .pipe(Effect.map((r) => r.UserPoolClient));
            }
            const attrs = attributesOf(observed);
            yield* session.note(attrs.clientId);
            return attrs;
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* cip
                .deleteUserPoolClient({
                UserPoolId: output.userPoolId,
                ClientId: output.clientId,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=UserPoolClient.js.map