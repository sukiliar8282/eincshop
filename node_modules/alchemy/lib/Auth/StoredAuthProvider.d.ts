import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import * as Interaction from "../Interaction.ts";
import { AuthError, type ConfigureField, type EnvironmentVariable } from "./AuthProvider.ts";
/**
 * Collected field values: one string per non-omitted field, keyed by
 * {@link ConfigureField.name}.
 */
export type StoredValue = string | Redacted.Redacted<string>;
export type StoredValues = Record<string, StoredValue | undefined>;
/** Reveal a collected value only at a validation or I/O boundary. */
export declare const storedValueText: (value: StoredValue | undefined) => string | undefined;
/** Preserve or introduce redaction for a collected secret. */
export declare const storedSecret: (value: StoredValue | undefined) => Redacted.Redacted<string> | undefined;
/**
 * Everything needed to generate a complete single-method ("stored")
 * {@link AuthProviderImpl} for a provider whose credential is a token (or a
 * small set of fields) the user pastes once: prompts, flag-driven
 * configuration, schema-validated inline values, login/logout, and
 * structured details.
 *
 * Providers with several auth methods (browser OAuth, SSO) don't fit this
 * factory — they hand-roll the impl and may still reuse
 * {@link collectFieldValues} for their token-shaped method.
 */
export interface StoredAuthProviderConfig<Resolved> {
    /** Registry name, e.g. `"Neon"`. */
    readonly provider: string;
    /** The fields collected interactively or via `--set`. */
    readonly fields: ReadonlyArray<ConfigureField>;
    /**
     * Derive additional stored values after input collection — e.g. resolve
     * an account id with an API call using the entered token. Runs for both
     * the interactive and flag-driven paths, before persistence.
     */
    readonly complete?: (values: StoredValues) => Effect.Effect<StoredValues, AuthError>;
    /**
     * Map validated stored values to the in-memory resolved credentials.
     * `source` distinguishes profile-stored values from CI env resolution.
     */
    readonly toResolved: (values: StoredValues, source: "stored") => Resolved;
    /** CI resolution from env vars; requires {@link environment}. */
    readonly readEnvironment?: Effect.Effect<Resolved, AuthError>;
    readonly environment?: ReadonlyArray<EnvironmentVariable>;
}
/** Inline-values type for factory-made static-token providers. */
export type StoredAuthConfig = {
    readonly method: "stored";
    readonly [key: string]: StoredValue | undefined;
};
/**
 * Validate flag-provided values against the field specs: unknown keys,
 * missing required fields, and per-field validators all fail with an
 * actionable {@link AuthError}.
 */
export declare const validateFieldValues: (provider: string, fields: ReadonlyArray<ConfigureField>, values: Record<string, string>) => Effect.Effect<StoredValues, AuthError>;
/**
 * Prompt for each field in order (secret fields masked, optional fields
 * skippable with an empty answer). Shared by the factory's interactive
 * `configure` and by hand-rolled multi-method providers that want the same
 * behavior for their token method.
 */
export declare const collectFieldValues: (fields: ReadonlyArray<ConfigureField>) => Effect.Effect<StoredValues, AuthError, Interaction.Interaction>;
/**
 * Build a registration Layer (plus the derived inline-values schema)
 * for a single-method stored-credential provider.
 *
 * ```ts
 * export const { layer: NeonAuth, storedSchema: NeonStoredCredentials } =
 *   makeStoredAuthProvider({
 *     provider: "Neon",
 *     fields: [{ name: "apiKey", label: "Neon API Key", secret: true }],
 *     toResolved: (values, source) => ({ ... }),
 *     readEnvironment: ...,
 *     environment: [...],
 *   });
 * ```
 */
export declare const makeStoredAuthProvider: <Resolved>(config: StoredAuthProviderConfig<Resolved>) => {
    layer: import("effect/Layer").Layer<never, never, import("./AuthProvider.ts").AuthProviders | import("effect/FileSystem").FileSystem | import("effect/Path").Path>;
    storedSchema: Schema.Codec<StoredValues, StoredValues, never, never>;
};
//# sourceMappingURL=StoredAuthProvider.d.ts.map