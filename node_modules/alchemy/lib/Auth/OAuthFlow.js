import * as Data from "effect/Data";
import * as Clock from "effect/Clock";
import * as Crypto from "effect/Crypto";
import * as Encoding from "effect/Encoding";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import http from "node:http";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import { AUTH_ERROR_URL, AUTH_SUCCESS_URL } from "./AuthProvider.js";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
export class OAuthError extends Data.TaggedError("OAuthError") {
}
/**
 * The local loopback callback server could not start (typically the port is
 * already taken). Distinct from {@link OAuthError} so callers can fall back to
 * manual code entry instead of failing the whole flow.
 */
export class CallbackServerStartError extends Data.TaggedError("CallbackServerStartError") {
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
export const OAuthCredentials = Schema.Struct({
    type: Schema.Literal("oauth"),
    clientId: Schema.optional(Schema.String),
    access: Schema.RedactedFromValue(Schema.String),
    refresh: Schema.RedactedFromValue(Schema.String),
    expires: Schema.Number,
    scopes: Schema.mutable(Schema.Array(Schema.String)),
});
const randomText = Effect.fn(function* (length) {
    const crypto = yield* Crypto.Crypto;
    const bytes = yield* crypto.randomBytes(length).pipe(Effect.mapError((cause) => new OAuthError({
        error: "crypto_error",
        errorDescription: `Secure random generation failed: ${cause}`,
    })));
    return Encoding.encodeBase64Url(bytes);
});
const generatePKCE = Effect.fn(function* (length = 96) {
    const crypto = yield* Crypto.Crypto;
    const verifier = yield* randomText(length);
    const challenge = yield* crypto
        .digest("SHA-256", new TextEncoder().encode(verifier))
        .pipe(Effect.mapError((cause) => new OAuthError({
        error: "crypto_error",
        errorDescription: `PKCE digest failed: ${cause}`,
    })));
    return { verifier, challenge: Encoding.encodeBase64Url(challenge) };
});
const TokenResponse = Schema.Struct({
    access_token: Schema.String,
    refresh_token: Schema.optional(Schema.String),
    expires_in: Schema.Number,
    scope: Schema.optional(Schema.String),
});
const TokenErrorResponse = Schema.Struct({
    error: Schema.String,
    error_description: Schema.optional(Schema.String),
});
export const makeOAuthClient = (spec) => {
    const provideHttp = (effect) => effect.pipe(Effect.provide(FetchHttpClient.layer));
    const clientAuthParams = () => spec.auth.kind === "clientSecret"
        ? { client_secret: Redacted.value(spec.auth.clientSecret) }
        : {};
    const extractCredentials = (json, previous) => {
        const refresh = json.refresh_token === undefined
            ? previous?.refresh
            : Redacted.make(json.refresh_token);
        if (!refresh) {
            return Effect.fail(new OAuthError({
                error: "invalid_token_response",
                errorDescription: "The provider did not return a refresh token for this authorization.",
            }));
        }
        return Effect.gen(function* () {
            const now = yield* Clock.currentTimeMillis;
            return {
                type: "oauth",
                clientId: spec.clientId,
                access: Redacted.make(json.access_token),
                refresh,
                expires: now + json.expires_in * 1000,
                scopes: json.scope?.split(" ") ?? previous?.scopes ?? [],
            };
        });
    };
    const tokenRequest = Effect.fn(function* (params, previous) {
        const client = yield* HttpClient.HttpClient;
        const transport = spec.tokenTransport ?? "body";
        const request = HttpClientRequest.post(spec.endpoints.token).pipe(HttpClientRequest.setHeader("Accept", "application/json"), transport === "query"
            ? HttpClientRequest.setUrlParams(params)
            : HttpClientRequest.bodyUrlParams(params));
        const response = yield* client.execute(request).pipe(Effect.mapError((cause) => new OAuthError({
            error: "network_error",
            errorDescription: `Token request failed: ${cause}`,
        })));
        if (response.status < 200 || response.status >= 300) {
            const json = yield* HttpClientResponse.schemaBodyJson(TokenErrorResponse)(response).pipe(Effect.mapError(() => new OAuthError({
                error: "parse_error",
                errorDescription: `Token endpoint returned ${response.status}`,
            })));
            return yield* new OAuthError({
                error: json.error,
                errorDescription: json.error_description ??
                    `Token endpoint returned ${response.status}`,
            });
        }
        const json = yield* HttpClientResponse.schemaBodyJson(TokenResponse)(response).pipe(Effect.mapError(() => new OAuthError({
            error: "parse_error",
            errorDescription: "Failed to parse token response",
        })));
        return yield* extractCredentials(json, previous);
    });
    const authorize = Effect.fn(function* (scopes) {
        const state = yield* randomText(32);
        const url = new URL(spec.endpoints.authorize);
        url.searchParams.set("client_id", spec.clientId);
        url.searchParams.set("redirect_uri", spec.redirectUri);
        url.searchParams.set("response_type", "code");
        if (scopes !== undefined) {
            url.searchParams.set("scope", scopes.join(" "));
        }
        url.searchParams.set("state", state);
        if (spec.auth.kind === "pkce") {
            const pkce = yield* generatePKCE();
            url.searchParams.set("code_challenge", pkce.challenge);
            url.searchParams.set("code_challenge_method", "S256");
            return { url: url.toString(), state, verifier: pkce.verifier };
        }
        return { url: url.toString(), state };
    });
    const exchange = Effect.fn(function (code, authorization) {
        return tokenRequest({
            grant_type: "authorization_code",
            code,
            client_id: spec.clientId,
            redirect_uri: spec.redirectUri,
            ...clientAuthParams(),
            ...(authorization?.verifier === undefined
                ? {}
                : { code_verifier: authorization.verifier }),
        });
    });
    const refresh = Effect.fn(function (credentials) {
        return tokenRequest({
            grant_type: "refresh_token",
            refresh_token: Redacted.value(credentials.refresh),
            client_id: spec.clientId,
            ...clientAuthParams(),
        }, credentials);
    });
    const revoke = Effect.fn(function* (credentials) {
        const endpoint = spec.endpoints.revoke;
        if (endpoint === undefined)
            return;
        const client = yield* HttpClient.HttpClient;
        const request = HttpClientRequest.post(endpoint).pipe(HttpClientRequest.setHeader("Accept", "application/json"), HttpClientRequest.bodyUrlParams({
            token: Redacted.value(credentials.refresh),
            token_type_hint: "refresh_token",
            client_id: spec.clientId,
            ...clientAuthParams(),
        }));
        yield* client.execute(request).pipe(Effect.mapError((cause) => new OAuthError({
            error: "network_error",
            errorDescription: `Revoke request failed: ${cause}`,
        })), Effect.asVoid);
    });
    const exchangeCallbackInput = Effect.fn(function* (input, authorization) {
        const value = input.trim();
        let code = value;
        let state = null;
        try {
            const url = new URL(value);
            code = url.searchParams.get("code") ?? "";
            state = url.searchParams.get("state");
        }
        catch {
            const separator = value.lastIndexOf("#");
            if (separator >= 0) {
                code = value.slice(0, separator);
                state = value.slice(separator + 1);
            }
        }
        if (!code) {
            return yield* new OAuthError({
                error: "invalid_request",
                errorDescription: "The authorization code is missing.",
            });
        }
        if (state !== null && state !== authorization.state) {
            return yield* new OAuthError({
                error: "invalid_request",
                errorDescription: "The authorization state does not match.",
            });
        }
        return yield* exchange(code, authorization);
    });
    const callback = Effect.fn(function* (authorization) {
        const { pathname, port, protocol } = new URL(spec.localCallbackUri);
        const listenPort = port === "" ? (protocol === "https:" ? 443 : 80) : Number(port);
        const listen = Effect.callback((resume) => {
            // The handler can run more than once (browser retries, extra tabs);
            // resume exactly once and ignore everything after.
            let settled = false;
            const resolveOnce = (effect) => {
                if (settled)
                    return;
                settled = true;
                resume(effect);
            };
            const server = http.createServer((req, res) => {
                const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
                if (url.pathname === "/auth/ping") {
                    res.writeHead(req.method === "OPTIONS" ? 204 : 200, {
                        "Access-Control-Allow-Origin": new URL(spec.redirectUri).origin,
                        "Access-Control-Allow-Methods": "GET, OPTIONS",
                        "Access-Control-Allow-Private-Network": "true",
                        "Cache-Control": "no-store",
                    });
                    res.end();
                    return;
                }
                if (url.pathname !== pathname) {
                    res.statusCode = 404;
                    res.end("Not Found");
                    return;
                }
                const error = url.searchParams.get("error");
                const errorDescription = url.searchParams.get("error_description");
                if (error) {
                    res.writeHead(302, { Location: AUTH_ERROR_URL });
                    res.end();
                    resolveOnce(Effect.fail(new OAuthError({
                        error,
                        errorDescription: errorDescription ?? "An unknown error occurred.",
                    })));
                    return;
                }
                const code = url.searchParams.get("code");
                const state = url.searchParams.get("state");
                if (!code || !state) {
                    res.writeHead(302, { Location: AUTH_ERROR_URL });
                    res.end();
                    resolveOnce(Effect.fail(new OAuthError({
                        error: "invalid_request",
                        errorDescription: "Missing code or state",
                    })));
                    return;
                }
                if (state !== authorization.state) {
                    res.writeHead(302, { Location: AUTH_ERROR_URL });
                    res.end();
                    resolveOnce(Effect.fail(new OAuthError({
                        error: "invalid_request",
                        errorDescription: "Invalid state",
                    })));
                    return;
                }
                resolveOnce(exchange(code, authorization).pipe(Effect.tap(() => Effect.sync(() => {
                    res.writeHead(302, { Location: AUTH_SUCCESS_URL });
                    res.end();
                })), Effect.tapError(() => Effect.sync(() => {
                    res.writeHead(302, { Location: AUTH_ERROR_URL });
                    res.end();
                }))));
            });
            server.on("error", (err) => {
                resolveOnce(Effect.fail(server.listening
                    ? new OAuthError({
                        error: "server_error",
                        errorDescription: `Callback server failed: ${err.message}`,
                    })
                    : new CallbackServerStartError({
                        message: `Failed to start callback server: ${err.message}`,
                    })));
            });
            server.listen(listenPort, "127.0.0.1");
            return Effect.sync(() => {
                server.close();
                // `close` only stops new connections — a keep-alive browser
                // connection would otherwise hold the process open until its
                // socket timeout after login completes.
                server.closeAllConnections();
            });
        });
        return yield* listen.pipe(Effect.timeoutOrElse({
            duration: "5 minutes",
            orElse: () => Effect.fail(new OAuthError({
                error: "timeout",
                errorDescription: "The authorization process timed out.",
            })),
        }));
    });
    return {
        clientId: spec.clientId,
        usesCurrentClient: (credentials) => credentials.clientId === spec.clientId,
        authorize,
        exchange: (...args) => provideHttp(exchange(...args)),
        exchangeCallbackInput: (...args) => provideHttp(exchangeCallbackInput(...args)),
        callback: (authorization) => provideHttp(callback(authorization)),
        refresh: (credentials) => provideHttp(refresh(credentials)),
        revoke: (credentials) => provideHttp(revoke(credentials)),
    };
};
//# sourceMappingURL=OAuthFlow.js.map