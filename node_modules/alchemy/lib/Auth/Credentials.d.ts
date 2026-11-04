import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import { AuthError } from "./AuthProvider.ts";
export declare const credentialsFilePath: (profile: string, provider: string) => string;
/**
 * Service exposing per-profile credential file helpers. All methods have
 * `R = never` — the {@link FileSystem.FileSystem} requirement is captured
 * by {@link CredentialsStoreLive} when the layer is built.
 *
 * Reads and writes go through the provider's declared credential schema, so
 * a hand-edited or corrupted secrets file surfaces as a typed `AuthError`
 * (with a reconfigure hint) instead of propagating malformed data into API
 * calls.
 */
export interface CredentialsStoreService {
    readonly read: <A, E>(profile: string, provider: string, schema: Schema.Codec<A, E>) => Effect.Effect<A | undefined, AuthError>;
    readonly write: <A, E>(profile: string, provider: string, schema: Schema.Codec<A, E>, credentials: A) => Effect.Effect<void, AuthError>;
    readonly delete: (profile: string, provider: string) => Effect.Effect<void, AuthError>;
    /**
     * Recursively remove the `~/.alchemy/credentials/{profile}` directory
     * containing all per-provider secrets for `profile`. No-op if it doesn't exist.
     */
    readonly deleteProfile: (profile: string) => Effect.Effect<void, AuthError>;
}
declare const CredentialsStore_base: Context.ServiceClass<CredentialsStore, "Alchemy::CredentialsStore", CredentialsStoreService>;
export declare class CredentialsStore extends CredentialsStore_base {
}
export declare const CredentialsStoreLive: Layer.Layer<CredentialsStore, never, FileSystem.FileSystem>;
export declare function displayRedacted(r: Redacted.Redacted<string>, visibleChars?: number): string;
export {};
//# sourceMappingURL=Credentials.d.ts.map