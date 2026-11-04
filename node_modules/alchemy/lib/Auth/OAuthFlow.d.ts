import * as Crypto from "effect/Crypto";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
declare const OAuthError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "OAuthError";
} & Readonly<A>;
export declare class OAuthError extends OAuthError_base<{
    error: string;
    errorDescription: string;
}> {
}
declare const CallbackServerStartError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "CallbackServerStartError";
} & Readonly<A>;
/**
 * The local loopback callback server could not start (typically the port is
 * already taken). Distinct from {@link OAuthError} so callers can fall back to
 * manual code entry instead of failing the whole flow.
 */
export declare class CallbackServerStartError extends CallbackServerStartError_base<{
    message: string;
}> {
}
/**
 * On-disk shape of OAuth credentials persisted under
 * `~/.alchemy/credentials/{profile}/<provider>-oauth.json`.
 *
 * `clientId` is optional because files written before the client id was
 * recorded must still parse — {@link OAuthClient.usesCurrentClient} treats a
 * missing id as "issued to a previous client", which triggers a clean
 * re-login.
 */
export declare const OAuthCredentials: Schema.Struct<{
    readonly type: Schema.Literal<"oauth">;
    readonly clientId: Schema.optional<Schema.String>;
    readonly access: Schema.RedactedFromValue<Schema.String>;
    readonly refresh: Schema.RedactedFromValue<Schema.String>;
    readonly expires: Schema.Number;
    readonly scopes: Schema.mutable<Schema.$Array<Schema.String>>;
}>;
export type OAuthCredentials = typeof OAuthCredentials.Type;
export interface Authorization {
    url: string;
    state: string;
    /** PKCE verifier; present only for `auth: { kind: "pkce" }` clients. */
    verifier?: string;
}
/**
 * The provider-specific facts a browser OAuth flow needs. Everything else —
 * state/PKCE generation, the loopback callback server, hosted-relay code
 * extraction, token exchange, refresh, revoke — is shared.
 */
export interface OAuthClientSpec {
    readonly clientId: string;
    readonly endpoints: {
        readonly authorize: string;
        readonly token: string;
        /** Providers without a revocation endpoint omit it; `revoke` then no-ops. */
        readonly revoke?: string;
    };
    /** Hosted relay redirect URI registered with the OAuth application. */
    readonly redirectUri: string;
    /** Loopback URI the local callback server listens on. */
    readonly localCallbackUri: string;
    /**
     * Client authentication. `pkce` for public clients; `clientSecret` for
     * providers whose token endpoint requires client authentication for every
     * grant (the secret ships in the CLI — same exposure posture as a public
     * client id, rotated by cutting a release).
     */
    readonly auth: {
        readonly kind: "pkce";
    } | {
        readonly kind: "clientSecret";
        readonly clientSecret: Redacted.Redacted<string>;
    };
    /**
     * How token-request parameters travel: URL-encoded POST body (the OAuth 2
     * standard, default) or the query string (PlanetScale's documented form).
     */
    readonly tokenTransport?: "body" | "query";
}
export interface OAuthClient {
    readonly clientId: string;
    /** Whether persisted credentials were issued to this client. */
    readonly usesCurrentClient: (credentials: {
        readonly clientId?: unknown;
    }) => boolean;
    /**
     * Generate an authorization URL. Pass `scopes` only for providers that
     * take them per-authorization; omit for providers whose scopes are
     * configured on the application.
     */
    readonly authorize: (scopes?: ReadonlyArray<string>) => Effect.Effect<Authorization, OAuthError, Crypto.Crypto>;
    /**
     * Exchange an authorization code directly. `authorization` supplies the
     * PKCE verifier; omit for non-PKCE clients (tests, relay-less flows).
     */
    readonly exchange: (code: string, authorization?: Authorization) => Effect.Effect<OAuthCredentials, OAuthError, never>;
    /**
     * Exchange a code copied from the hosted relay page, or extract the code
     * from either the hosted or loopback callback URL.
     */
    readonly exchangeCallbackInput: (input: string, authorization: Authorization) => Effect.Effect<OAuthCredentials, OAuthError, never>;
    /**
     * Start a local HTTP server to listen for the OAuth callback, exchange
     * the authorization code, and return the credentials. Times out after 5
     * minutes.
     */
    readonly callback: (authorization: Authorization) => Effect.Effect<OAuthCredentials, OAuthError | CallbackServerStartError, never>;
    /** Refresh expired OAuth credentials with the stored refresh token. */
    readonly refresh: (credentials: OAuthCredentials) => Effect.Effect<OAuthCredentials, OAuthError, never>;
    /** Revoke the refresh token; no-op when the spec has no revoke endpoint. */
    readonly revoke: (credentials: OAuthCredentials) => Effect.Effect<void, OAuthError>;
}
export declare const makeOAuthClient: (spec: OAuthClientSpec) => OAuthClient;
export {};
//# sourceMappingURL=OAuthFlow.d.ts.map