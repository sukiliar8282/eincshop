import * as Config from "effect/Config";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import { AuthError } from "./AuthProvider.ts";
import { ProfileError, ProfileStore } from "./Profile.ts";
/**
 * Resolve the selected Alchemy profile after the command's dotenv provider is
 * known. An omitted explicit override remains absent so it does not shadow
 * `ALCHEMY_PROFILE` from `.env` / `--env-file`.
 */
export declare const resolveProfileSelection: (envFile: Option.Option<string>, override: string | undefined) => Effect.Effect<{
    name: string;
    source: "command-line" | "configuration" | "default";
}, import("effect/PlatformError").PlatformError | ProfileError, import("effect/FileSystem").FileSystem | ProfileStore>;
export declare const resolveProfileName: (envFile: Option.Option<string>, override: string | undefined) => Effect.Effect<string, import("effect/PlatformError").PlatformError | ProfileError, import("effect/FileSystem").FileSystem | ProfileStore>;
/**
 * The shared preamble of every per-cloud `fromAuthProvider` /
 * `fromEnvironment` layer. Precedence: environment credentials (process
 * environment plus `.env` / `--env-file`) whenever the provider's declared
 * contract is fully present — CI or not, selected profile or not — then, in
 * CI, the provider's environment resolution alone (profiles do not exist
 * there), otherwise the selected profile.
 */
export declare const resolveProviderConfig: <C extends {
    method: string;
} = any, Credentials = any>(providerName: string) => Effect.Effect<{
    auth: import("./AuthProvider.ts").AuthProvider<C, Credentials>;
    profileName: undefined;
    config: undefined;
    resolve: Effect.Effect<Credentials, AuthError, never>;
    source: "environment";
} | {
    auth: import("./AuthProvider.ts").AuthProvider<C, Credentials>;
    profileName: string;
    config: C;
    resolve: Effect.Effect<Credentials, AuthError | import("./AuthProvider.ts").NeedsReauth, never>;
    source: "profile";
}, AuthError | Config.ConfigError | import("./Profile.ts").MissingProviderConfig | import("effect/PlatformError").PlatformError | ProfileError, import("./AuthProvider.ts").AuthProviders | ProfileStore>;
/** Let an explicit profile override configured selection without disturbing other keys. */
export declare const withProfileOverride: (base: ConfigProvider.ConfigProvider, profile: string | undefined) => ConfigProvider.ConfigProvider;
//# sourceMappingURL=Resolve.d.ts.map