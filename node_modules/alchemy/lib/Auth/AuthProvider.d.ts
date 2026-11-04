import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Path from "effect/Path";
import * as Schema from "effect/Schema";
import { Interaction } from "../Interaction.ts";
import { UserFacingError } from "../UserFacingError.ts";
/**
 * Canonical web host for OAuth provider-agnostic landing pages
 * (`/auth/success`, `/auth/error`). The CLI's loopback server 302s the
 * browser to one of these after handling the OAuth callback. Centralized
 * here so the redirect target lives in exactly one place across all
 * provider OAuth clients.
 */
export declare const AUTH_LANDING_HOST = "https://alchemy.run";
export declare const AUTH_SUCCESS_URL = "https://alchemy.run/auth/success";
export declare const AUTH_ERROR_URL = "https://alchemy.run/auth/error";
declare const AuthError_base: Schema.Class<AuthError, Schema.TaggedStruct<"AuthError", {
    readonly message: Schema.String;
    readonly cause: Schema.optional<Schema.Defect>;
}>, import("effect/Cause").YieldableError>;
export declare class AuthError extends AuthError_base {
    readonly [UserFacingError] = true;
}
declare const NeedsReauth_base: Schema.Class<NeedsReauth, Schema.TaggedStruct<"NeedsReauth", {
    readonly provider: Schema.String;
    readonly profile: Schema.String;
    readonly message: Schema.String;
    readonly cause: Schema.optional<Schema.Defect>;
}>, import("effect/Cause").YieldableError>;
/**
 * Stored credentials exist (or are expected) but cannot be used until the
 * user re-authenticates: missing values, an expired/rotated
 * token, or a session the provider can no longer refresh silently. The
 * profile UI renders this as "needs re-login" instead of a generic error,
 * and callers match it with `Effect.catchTag("NeedsReauth", ...)` — never
 * by inspecting the message.
 */
export declare class NeedsReauth extends NeedsReauth_base {
    readonly [UserFacingError] = true;
}
/**
 * Standard remediation hint appended to stored-credential errors
 * ("credentials not found", "refresh failed", ...). Deliberately generic —
 * the explicit command is correct from any surface, including inside the
 * profile dashboard (where `r` is merely the shortcut for it). Centralized
 * so the phrasing lives in one place; surface-aware wording can layer on
 * top later without touching call sites.
 */
export declare const refreshHint: (provider: string, profileName: string) => string;
/** {@link refreshHint}'s sibling for reconfiguration. */
export declare const reconfigureHint: (provider: string, profileName: string) => string;
declare const AuthProviders_base: Context.ServiceClass<AuthProviders, "AuthProviders", {
    [providerName: string]: AuthProvider<{
        method: string;
    }, unknown>;
}>;
export declare class AuthProviders extends AuthProviders_base {
}
/**
 * Declares one environment variable a provider's {@link AuthProviderImpl.readEnvironment}
 * consumes. Profiles are not available in CI — environment variables are the
 * only CI credential source — so this metadata is the machine-readable
 * contract for "what must CI set": rendered in docs, surfaced by the CLI,
 * and available to tooling through the {@link AuthProviders} registry.
 */
export declare const EnvironmentVariable: Schema.Struct<{
    /** Environment variable name, e.g. `CLOUDFLARE_API_TOKEN`. */
    readonly name: Schema.String;
    /** What the variable configures and when it applies. */
    readonly description: Schema.optional<Schema.String>;
    /**
     * Whether credential resolution fails when neither this variable nor one
     * of its {@link alternatives} is set. Use `description` to explain
     * conditional requirements (e.g. "required unless X is set").
     */
    readonly required: Schema.Boolean;
    /** Holds a secret — display surfaces must redact its value. */
    readonly secret: Schema.optional<Schema.Boolean>;
    /**
     * Alternative variable names that satisfy the same requirement, in
     * precedence order after {@link name} (e.g. `AWS_DEFAULT_REGION` for
     * `AWS_REGION`).
     */
    readonly alternatives: Schema.optional<Schema.$Array<Schema.String>>;
}>;
export type EnvironmentVariable = typeof EnvironmentVariable.Type;
/** Render a one-line summary of a provider's environment contract. */
export declare const describeEnvironment: (environment: ReadonlyArray<EnvironmentVariable>) => string;
/**
 * The variable names a provider's environment resolution would consume, or
 * `undefined` when the declared contract is not fully satisfied (some
 * required variable has no non-empty value). Reads through the ambient
 * `ConfigProvider` — the process environment plus `.env` / `--env-file` —
 * so it sees exactly what `readEnvironment` will. Environment credentials
 * take precedence over any profile, CI or not; the returned names tell the
 * user exactly which keys won.
 */
export declare const presentEnvironment: (environment: ReadonlyArray<EnvironmentVariable>) => Effect.Effect<string[] | undefined, Config.ConfigError, never>;
/**
 * One rendered line of a provider's credential details: `key: value`.
 * Values must arrive pre-redacted (see `displayRedacted`) — the display
 * layer renders them verbatim.
 */
export interface ProviderDetailLine {
    readonly key: string;
    readonly value: string;
}
/**
 * Structured result of {@link AuthProviderImpl.details} — what
 * `alchemy profile show` and the dashboard render for a connected
 * provider. Replaces the old `prettyPrint` Console-capture contract.
 */
export interface ProviderDetails {
    readonly lines: ReadonlyArray<ProviderDetailLine>;
}
/**
 * One input a provider's flag-driven (non-interactive) configuration
 * accepts — the machine-readable half of `alchemy profile edit --add
 * <provider> --method <m> --set <name>=<value>`.
 */
export interface ConfigureField {
    /** `--set` key and, for stored-credential providers, the stored JSON property. */
    readonly name: string;
    /** Human prompt label, e.g. "Cloudflare API Token". */
    readonly label: string;
    /** Secondary guidance shown beneath the interactive input. */
    readonly description?: string;
    /** Masked during prompts and redacted in details. @default false */
    readonly secret?: boolean;
    /** May be omitted. @default false */
    readonly optional?: boolean;
    readonly placeholder?: string;
    readonly defaultValue?: string;
    /** Return an error message for an invalid value, undefined when valid. */
    readonly validate?: (value: string) => string | undefined;
}
/**
 * The flag-driven configuration contract a provider exposes per method:
 * which `--method` names are accepted and which `--set` fields each one
 * takes. Interactive-only methods (browser OAuth, SSO) simply don't
 * appear here.
 */
export interface ConfigureMethod {
    /**
     * `--method` value. Always the same literal the provider persists as the
     * config's `method` (`"stored"`, `"sso"`, `"local"`, `"env"`), so the
     * flag and the credentials file speak one vocabulary.
     */
    readonly method: string;
    readonly fields: ReadonlyArray<ConfigureField>;
}
export interface AuthProviderImpl<Config extends {
    method: string;
} = {
    method: string;
}, Credentials = unknown, R = never> {
    /**
     * Schema for the provider-owned `values` object ({@link Config}). Stored
     * entries are user-editable JSON that may also come from a newer or
     * older alchemy, so every load decodes against this schema — an invalid
     * entry fails with a reconfigure hint instead of reaching provider code
     * that matches exhaustively on `method`.
     */
    readonly configSchema: Schema.Codec<Config>;
    configure(profileName: string, currentConfig?: Config): Effect.Effect<Config, AuthError, R | Interaction>;
    /**
     * Flag-driven configuration for scripts and agents: validated `--set`
     * values for one of the methods declared in {@link configureMethods}.
     * Optional — interactive-only providers omit it.
     */
    configureWith?(profileName: string, input: {
        readonly method: string;
        readonly values: Record<string, string>;
    }): Effect.Effect<Config, AuthError, R | Interaction>;
    /**
     * The methods {@link configureWith} accepts and their fields. Required
     * whenever `configureWith` is implemented so the CLI can validate and
     * document the flags.
     */
    readonly configureMethods?: ReadonlyArray<ConfigureMethod>;
    login(profileName: string, config: Config, updateConfig?: (config: Config) => Effect.Effect<void, AuthError>): Effect.Effect<Config | void, AuthError, R | Interaction>;
    logout(profileName: string, config: Config): Effect.Effect<void, AuthError, R | Interaction>;
    /**
     * Structured credential details for display. Fails with
     * {@link NeedsReauth} when stored credentials exist but require
     * re-authentication, so the UI can render "needs re-login" instead of a
     * generic error.
     */
    details(profileName: string, config: Config, updateConfig?: (config: Config) => Effect.Effect<void, AuthError>): Effect.Effect<ProviderDetails, AuthError | NeedsReauth, R | Interaction>;
    /**
     * Resolve credentials from the profile values, silently refreshing when the
     * provider supports it. MUST be non-interactive — this is the only method
     * (with {@link readEnvironment}) that child processes exercise, and their
     * graphs carry no interaction services. When re-authentication is needed,
     * fail with {@link NeedsReauth} instead of prompting.
     */
    read(profileName: string, config: Config, updateConfig?: (config: Config) => Effect.Effect<void, AuthError>): Effect.Effect<Credentials, AuthError | NeedsReauth, R>;
    /**
     * Resolve credentials directly from the process environment for CI.
     * This never creates, selects, or mutates an Alchemy profile.
     */
    readonly readEnvironment?: Effect.Effect<Credentials, AuthError, R>;
    /**
     * The environment variables {@link readEnvironment} consumes. Required
     * whenever `readEnvironment` is implemented — profiles do not exist in CI,
     * so this list is the provider's entire CI configuration contract. Names
     * only, never values.
     */
    readonly environment?: ReadonlyArray<EnvironmentVariable>;
}
export interface AuthProvider<Config extends {
    method: string;
} = {
    method: string;
}, Credentials = unknown> extends AuthProviderImpl<Config, Credentials> {
    readonly kind: "AuthProvider";
    readonly name: string;
    /** Log each environment contract once per built provider layer. */
    readonly logEnvironmentCredentials: (used: ReadonlyArray<string>) => Effect.Effect<void>;
    /**
     * The provider's declared CI environment contract. Empty when the
     * provider does not support environment credentials.
     */
    readonly environment: ReadonlyArray<EnvironmentVariable>;
    /**
     * Decode raw provider values against {@link AuthProviderImpl.configSchema}.
     * Fails with an {@link AuthError} carrying the reconfigure hint, so every
     * consumer of stored configuration reports invalid entries the same way.
     */
    decodeConfig(profileName: string, config: unknown): Effect.Effect<Config, AuthError>;
}
export declare const AuthProvider: <Config extends {
    method: string;
}, Credentials>() => <R = never, ImplReq = never>(name: string, impl: AuthProviderImpl<Config, Credentials, R> | Effect.Effect<AuthProviderImpl<Config, Credentials, R>, never, ImplReq>) => Effect.Effect<undefined, never, ImplReq | R | AuthProviders | FileSystem.FileSystem | Path.Path>;
/**
 * Build a Layer that registers an AuthProvider into the {@link AuthProviders}
 * registry when its parent layer is built. Use this from a provider's
 * top-level `providers()` Layer so that the alchemy CLI can discover the
 * provider via the registry without forcing credential resolution.
 */
export declare const AuthProviderLayer: <Config extends {
    method: string;
}, Credentials>() => <R = never, ImplReq = never>(name: string, impl: AuthProviderImpl<Config, Credentials, R> | Effect.Effect<AuthProviderImpl<Config, Credentials, R>, never, ImplReq>) => Layer.Layer<never, never, AuthProviders | FileSystem.FileSystem | Path.Path | Exclude<ImplReq, import("effect/Scope").Scope> | Exclude<R, import("effect/Scope").Scope>>;
/**
 * Look up a registered {@link AuthProvider} by name. Fails with
 * {@link AuthError} if the provider hasn't been registered (typically because
 * its layer hasn't been built).
 */
export declare const getAuthProvider: <Config extends {
    method: string;
} = {
    method: string;
}, Credentials = unknown>(name: string) => Effect.Effect<AuthProvider<Config, Credentials>, AuthError, AuthProviders>;
export {};
//# sourceMappingURL=AuthProvider.d.ts.map