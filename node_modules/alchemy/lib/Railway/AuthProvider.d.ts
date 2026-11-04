import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import type { ChildProcessSpawner } from "effect/unstable/process/ChildProcessSpawner";
export declare const RAILWAY_AUTH_PROVIDER_NAME = "Railway";
export declare const RAILWAY_API_TOKEN_ENV = "RAILWAY_API_TOKEN";
export declare const RAILWAY_API_URL_ENV = "RAILWAY_API_URL";
/** Typed values stored in a Railway provider profile document. */
export declare const RailwayAuthConfigSchema: Schema.Union<readonly [Schema.Struct<{
    readonly method: Schema.Literal<"env">;
}>, Schema.Struct<{
    readonly method: Schema.Literal<"stored">;
    readonly token: Schema.String;
    readonly apiBaseUrl: Schema.optional<Schema.String>;
}>, Schema.Struct<{
    readonly method: Schema.Literal<"oauth">;
    readonly token: Schema.String;
    readonly apiBaseUrl: Schema.optional<Schema.String>;
}>]>;
export type RailwayAuthConfig = typeof RailwayAuthConfigSchema.Type;
export type RailwayResolvedCredentials = {
    type: "token";
    token: Redacted.Redacted<string>;
    tokenKind: "account";
    apiBaseUrl: string;
    source: {
        type: RailwayAuthConfig["method"];
        details?: string;
    };
};
/**
 * Layer that registers the Railway {@link AuthProvider} into the
 * {@link AuthProviders} registry. Include this in the Railway `providers()`
 * layer so the alchemy CLI can discover it.
 *
 * Supported methods:
 * - `env`: reads `RAILWAY_API_TOKEN` (account Bearer). Project tokens are
 *   not used — they cannot reach workspace-wide operations.
 * - `stored`: prompts for an API token and stores it in the provider file.
 * - `oauth`: CLI login session (`loginSessionCreate` → open the pairing URL →
 *   poll `loginSessionVerify` / `loginSessionConsume` → store the token).
 *   Does not require a pre-existing token. An optional `RAILWAY_API_URL`
 *   overrides the backboard host (default `https://backboard.railway.com`).
 */
export declare const RailwayAuth: import("effect/Layer").Layer<never, never, import("../index.ts").AuthProviders | ChildProcessSpawner | import("effect/FileSystem").FileSystem | import("effect/Path").Path>;
//# sourceMappingURL=AuthProvider.d.ts.map