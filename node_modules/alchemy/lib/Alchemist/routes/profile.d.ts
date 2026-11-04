import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import type { Interaction } from "../../Interaction.ts";
import { AuthError } from "../../Auth/AuthProvider.ts";
import { CredentialsStore } from "../../Auth/Credentials.ts";
import { type ProviderConnection } from "../../Auth/Inspect.ts";
import { ProfileStore } from "../../Auth/Profile.ts";
import { AlchemistInvalidInput, AlchemistNotFound } from "../Errors.ts";
import { type Target } from "../Session.ts";
/** Which project/profile pair a provider-scoped route resolves against. */
export interface ProviderContext extends Target {
    readonly profile: string;
}
export interface ProfileSummary {
    readonly name: string;
    readonly active: boolean;
    readonly providers: ReadonlyArray<{
        readonly name: string;
        readonly method: string;
    }>;
}
export type { ProviderConnection } from "../../Auth/Inspect.ts";
export interface ProfileSnapshot {
    readonly name: string;
    readonly active: boolean;
    readonly providers: ReadonlyArray<ProviderConnection>;
}
export interface ConfigureField {
    readonly name: string;
    readonly label: string;
    readonly secret: boolean;
    readonly required: boolean;
    readonly description?: string;
    readonly placeholder?: string;
}
export interface ConfigureMethod {
    readonly method: string;
    readonly label: string;
    readonly fields: ReadonlyArray<ConfigureField>;
}
export interface AuthProviderDescriptor {
    readonly name: string;
    readonly connected: boolean;
    readonly configureMethods: ReadonlyArray<ConfigureMethod>;
    readonly supportsRefresh: boolean;
    readonly supportsLogout: boolean;
}
export interface ConfigureInput extends ProviderContext {
    readonly provider: string;
    readonly action: "add" | "reconfigure";
    readonly method?: string;
    readonly values?: Readonly<Record<string, Redacted.Redacted<string>>>;
}
/** The effective profile and how it was selected. */
export declare const current: () => Effect.Effect<import("../../Auth/Profile.ts").ProfileSelection, import("effect/PlatformError").PlatformError | import("../../Auth/Profile.ts").ProfileError, ProfileStore>;
/** Every profile with its connected providers, active profile first. */
export declare const list: () => Effect.Effect<ProfileSummary[], import("effect/PlatformError").PlatformError | import("../../Auth/Profile.ts").ProfileError, ProfileStore>;
/** One profile with the live status of each connected provider. */
export declare const get: (input: {
    readonly name: string;
    readonly includeProviderStatus?: boolean;
    readonly entrypoint?: string;
    readonly envFile?: string;
}) => Effect.Effect<{
    name: string;
    active: boolean;
    providers: ProviderConnection[];
}, AlchemistNotFound | AuthError | import("effect/PlatformError").PlatformError | import("../../Auth/Profile.ts").ProfileError, import("../../AlchemyContext.ts").AlchemyContext | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | Interaction | import("effect/Path").Path | ProfileStore | import("effect/Scope").Scope>;
export declare const create: (input: {
    readonly name: string;
}) => Effect.Effect<{
    name: string;
    active: boolean;
    providers: ProviderConnection[];
}, AlchemistNotFound | AuthError | import("effect/PlatformError").PlatformError | import("../../Auth/Profile.ts").ProfileError, import("../../AlchemyContext.ts").AlchemyContext | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | Interaction | import("effect/Path").Path | ProfileStore | import("effect/Scope").Scope>;
export declare const rename: (input: {
    readonly name: string;
    readonly newName: string;
}) => Effect.Effect<{
    name: string;
    active: boolean;
    providers: ProviderConnection[];
}, AlchemistNotFound | AuthError | import("effect/PlatformError").PlatformError | import("../../Auth/Profile.ts").ProfileError, import("../../AlchemyContext.ts").AlchemyContext | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | Interaction | import("effect/Path").Path | ProfileStore | import("effect/Scope").Scope>;
/** Delete a profile and every credential stored for it. */
export declare const deleteProfile: (input: {
    readonly name: string;
}) => Effect.Effect<{
    readonly name: string;
    readonly credentialsDeleted: true;
}, AlchemistNotFound | AuthError | import("effect/PlatformError").PlatformError | import("../../Auth/Profile.ts").ProfileError, CredentialsStore | import("effect/FileSystem").FileSystem | import("effect/Path").Path | ProfileStore>;
/** Every registered auth provider and how it can be configured. */
export declare const providers: (input: {
    readonly profile?: string;
    readonly entrypoint?: string;
    readonly envFile?: string;
}) => Effect.Effect<AuthProviderDescriptor[], AuthError | import("effect/PlatformError").PlatformError | import("../../Auth/Profile.ts").ProfileError, import("../../AlchemyContext.ts").AlchemyContext | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | import("effect/Path").Path | ProfileStore | import("effect/Scope").Scope>;
/** The configure methods (and fields) one provider accepts. */
export declare const configureForm: (input: {
    readonly profile: string;
    readonly provider: string;
    readonly method?: string;
}) => Effect.Effect<readonly ConfigureMethod[], AlchemistNotFound | AuthError | import("effect/PlatformError").PlatformError | import("../../Auth/Profile.ts").ProfileError, import("../../AlchemyContext.ts").AlchemyContext | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | import("effect/Path").Path | ProfileStore | import("effect/Scope").Scope>;
/**
 * Connect or reconfigure a provider in a profile. Reported through
 * {@link Progress} as `ProviderConfigureStarted`; interactive providers drive
 * their own prompts.
 */
export declare const configure: (input: ConfigureInput) => Effect.Effect<{
    name: string;
    active: boolean;
    providers: ProviderConnection[];
}, AlchemistInvalidInput | AlchemistNotFound | AuthError | import("effect/PlatformError").PlatformError | import("../../Auth/Profile.ts").ProfileError, import("../../AlchemyContext.ts").AlchemyContext | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | Interaction | import("effect/Path").Path | ProfileStore | import("effect/Scope").Scope>;
/** Log a provider out and disconnect it from the profile. */
export declare const removeProvider: (input: ProviderContext & {
    readonly provider: string;
    readonly logout?: boolean;
}) => Effect.Effect<{
    profile: string;
    provider: string;
    logout: "completed" | "skipped-invalid-config" | "unavailable";
}, AlchemistNotFound | AuthError | import("effect/PlatformError").PlatformError | import("../../Auth/Profile.ts").ProfileError, import("../../AlchemyContext.ts").AlchemyContext | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | Interaction | import("effect/Path").Path | ProfileStore | import("effect/Scope").Scope>;
/**
 * Re-run login for connected providers without reconfiguring them. Each
 * provider is reported through {@link Progress} as `ProviderRefreshStarted`.
 */
export declare const refresh: (input: ProviderContext & {
    readonly providers?: ReadonlyArray<string>;
}) => Effect.Effect<{
    name: string;
    active: boolean;
    providers: ProviderConnection[];
}, AlchemistInvalidInput | AlchemistNotFound | AuthError | import("effect/PlatformError").PlatformError | import("../../Auth/Profile.ts").ProfileError, import("../../AlchemyContext.ts").AlchemyContext | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | Interaction | import("effect/Path").Path | ProfileStore | import("effect/Scope").Scope>;
//# sourceMappingURL=profile.d.ts.map