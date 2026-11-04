import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
/**
 * Canonical name registered in {@link AuthProviders}. Use this key to look
 * up the PlanetScale {@link AuthProvider} from inside provider Layers.
 */
export declare const PLANETSCALE_AUTH_PROVIDER_NAME = "Planetscale";
/**
 * Typed values stored in a PlanetScale provider profile document. Both
 * service-token and OAuth values are inline. PlanetScale has no PKCE flow,
 * so the OAuth application's
 *   `client_secret` ships in the CLI — see {@link OAuthClient}.
 */
export declare const PlanetscaleAuthConfigSchema: Schema.Union<readonly [Schema.Struct<{
    readonly method: Schema.Literal<"stored">;
    readonly tokenId: Schema.String;
    readonly token: Schema.String;
    readonly organization: Schema.String;
}>, Schema.Struct<{
    readonly method: Schema.Literal<"oauth">;
    readonly organization: Schema.String;
    readonly clientId: Schema.optional<Schema.String>;
    readonly access: Schema.String;
    readonly refresh: Schema.String;
    readonly expires: Schema.Number;
    readonly scopes: Schema.mutable<Schema.$Array<Schema.String>>;
}>]>;
export type PlanetscaleAuthConfig = typeof PlanetscaleAuthConfigSchema.Type;
/**
 * Resolved in-memory PlanetScale credentials returned by
 * {@link AuthProviderImpl.read}. Either a service token (`tokenId`/`token`)
 * or an OAuth access token.
 */
export type PlanetscaleResolvedCredentials = {
    type: "apiToken";
    tokenId: Redacted.Redacted<string>;
    token: Redacted.Redacted<string>;
    organization: string;
    source: {
        type: PlanetscaleAuthConfig["method"] | "env";
        details?: string;
    };
} | {
    type: "oauth";
    accessToken: Redacted.Redacted<string>;
    expires: number;
    organization: string;
    source: {
        type: PlanetscaleAuthConfig["method"] | "env";
        details?: string;
    };
};
/**
 * Layer that registers the PlanetScale {@link AuthProvider} into the
 * {@link AuthProviders} registry when built. Include this in the
 * PlanetScale `providers()` layer so the alchemy CLI can discover it.
 *
 * Supported methods:
 * - `stored`: prompts for a service token and stores it inline.
 * - `oauth`: browser-based login storing access/refresh values inline.
 */
export declare const PlanetscaleAuth: Layer.Layer<never, never, import("../index.ts").AuthProviders | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/Path").Path>;
//# sourceMappingURL=AuthProvider.d.ts.map