import type { CredentialsError } from "@distilled.cloud/aws/Credentials";
import * as EffectConsole from "effect/Console";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Path from "effect/Path";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import type { ChildProcessSpawner } from "effect/unstable/process/ChildProcessSpawner";
import { AuthError } from "../Auth/AuthProvider.ts";
export declare const AWS_AUTH_PROVIDER_NAME = "AWS";
export declare const DEFAULT_LOCAL_ENDPOINT = "http://localhost:4566";
/**
 * Dummy account stamped on every floci environment.
 * A custom `AWS_ENDPOINT_URL` on env/sso credentials does NOT use this —
 * those keep the real account from STS / `AWS_ACCOUNT_ID`.
 */
export declare const LOCAL_ACCOUNT_ID = "000000000000";
export declare const silentConsole: EffectConsole.Console;
/** Typed values stored in an AWS provider profile document. */
export declare const AwsAuthConfigSchema: Schema.Union<readonly [Schema.Struct<{
    readonly method: Schema.Literal<"sso">;
    readonly ssoProfile: Schema.String;
    readonly authorizationMethod: Schema.optional<Schema.Union<readonly [Schema.Literal<"oauth">, Schema.Literal<"device">]>>;
}>, Schema.Struct<{
    readonly method: Schema.Literal<"stored">;
    readonly accountId: Schema.optional<Schema.String>;
    readonly accessKeyId: Schema.String;
    readonly secretAccessKey: Schema.String;
    readonly sessionToken: Schema.optional<Schema.String>;
    readonly region: Schema.String;
}>]>;
export type AwsAuthConfig = typeof AwsAuthConfigSchema.Type;
export interface AwsResolvedCredentials {
    accountId: string;
    credentials: Effect.Effect<AwsCredentials, CredentialsError>;
    region: string;
    endpoint?: string;
    source: {
        type: AwsAuthConfig["method"] | "env";
        details?: string;
    };
}
interface AwsCredentials {
    accessKeyId: Redacted.Redacted<string>;
    secretAccessKey: Redacted.Redacted<string>;
    sessionToken: Redacted.Redacted<string> | undefined;
    region: string;
}
/**
 * An explicitly-set `AWS_REGION` env var wins over the region recorded in an
 * SSO profile (`~/.aws/config`) or in stored credentials. `AWS_DEFAULT_REGION`
 * deliberately does NOT override — it is a *default* for when no region is
 * configured anywhere, and the profile's region is explicit configuration.
 */
export declare const applyEnvRegionOverride: <C extends {
    region: string;
}>(creds: C) => Effect.Effect<C, AuthError>;
/**
 * Layer that registers the AWS {@link AuthProvider} into the
 * {@link AuthProviders} registry when built. Include this in the AWS
 * `providers()` layer so the alchemy CLI can discover it.
 */
export declare const AwsAuth: Layer.Layer<never, never, import("../index.ts").AuthProviders | ChildProcessSpawner | FileSystem.FileSystem | HttpClient.HttpClient | Path.Path>;
export declare const parseAwsSsoLoginOutput: (output: string) => {
    url: string | undefined;
    code: string | undefined;
};
export {};
//# sourceMappingURL=AuthProvider.d.ts.map