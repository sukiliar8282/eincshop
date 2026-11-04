import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import { AuthError } from "../../Auth/AuthProvider.ts";
/** Typed values stored in a Cloudflare provider profile document. */
export declare const CloudflareAuthConfigSchema: Schema.Union<readonly [Schema.Struct<{
    readonly method: Schema.Literal<"stored">;
    readonly credentialType: Schema.Literal<"apiToken">;
    readonly apiToken: Schema.String;
    readonly accountId: Schema.String;
}>, Schema.Struct<{
    readonly method: Schema.Literal<"stored">;
    readonly credentialType: Schema.Literal<"apiKey">;
    readonly apiKey: Schema.String;
    readonly email: Schema.String;
    readonly accountId: Schema.String;
}>, Schema.Struct<{
    readonly method: Schema.Literal<"oauth">;
    readonly scopes: Schema.mutable<Schema.$Array<Schema.String>>;
    readonly accountId: Schema.String;
    readonly clientId: Schema.optional<Schema.String>;
    readonly access: Schema.String;
    readonly refresh: Schema.String;
    readonly expires: Schema.Number;
}>, Schema.Struct<{
    readonly method: Schema.Literal<"oauth">;
}>]>;
export type CloudflareAuthConfig = typeof CloudflareAuthConfigSchema.Type;
export type CloudflareResolvedCredentials = {
    type: "apiToken";
    apiToken: Redacted.Redacted<string>;
    accountId: string;
    source: {
        type: CloudflareAuthConfig["method"] | "env";
        details?: string;
    };
} | {
    type: "apiKey";
    apiKey: Redacted.Redacted<string>;
    email: Redacted.Redacted<string>;
    accountId: string;
    source: {
        type: CloudflareAuthConfig["method"] | "env";
        details?: string;
    };
} | {
    type: "oauth";
    accessToken: Redacted.Redacted<string>;
    expires: number;
    accountId: string;
    source: {
        type: CloudflareAuthConfig["method"] | "env";
        details?: string;
    };
};
export declare const CLOUDFLARE_AUTH_PROVIDER_NAME = "Cloudflare";
export declare const validateAccountId: (accountId: string | undefined, source: string) => Effect.Effect<string, AuthError>;
/** Field-level validator reusing {@link ACCOUNT_ID_PATTERN}. */
export declare const validateAccountIdField: (v: string) => string | undefined;
//# sourceMappingURL=AuthConfig.d.ts.map