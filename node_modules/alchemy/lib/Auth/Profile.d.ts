import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Path from "effect/Path";
import type { PlatformError } from "effect/PlatformError";
import * as Schema from "effect/Schema";
import { UserFacingError } from "../UserFacingError.ts";
import { AuthError, type AuthProvider } from "./AuthProvider.ts";
export { configFilePath, credentialsDirPath, profileCredentialsDirPath, profileDirPath, profileProviderFilePath, profilesDirPath, rootDir, } from "./Paths.ts";
/** Config key selecting a directory under `~/.alchemy/profiles`. */
export declare const ALCHEMY_PROFILE: Config.Config<string>;
/** Version of the synthesized in-memory manifest returned by readManifest. */
export declare const PROFILE_MANIFEST_VERSION = 3;
/** Stable format identifier for an individual provider profile document. */
export declare const PROFILE_FORMAT: "alchemy.profile/v1";
export declare const DEFAULT_PROFILE_NAME = "default";
export declare const DEFAULT_PROFILE_ID = "default";
/**
 * The minimum contract shared by provider-owned values. Providers refine this
 * with their own Effect Schema codec. The method is deliberately an open
 * string: adding an auth method never changes Alchemy's storage schema.
 */
export declare const ProviderConfigSchema: Schema.$Record<Schema.String, Schema.Unknown>;
export interface ProviderConfig {
    readonly method?: string;
    readonly [key: string]: unknown;
}
/** User-facing, non-secret annotations. Provider schemas may refine it. */
export declare const ProfileMetadataSchema: Schema.$Record<Schema.String, Schema.Unknown>;
export type ProfileMetadata = typeof ProfileMetadataSchema.Type;
/**
 * Base on-disk schema. Only this envelope is owned by Alchemy core; the
 * selected AuthProvider decodes `metadata` and `values` with its own schemas.
 */
export declare const ProviderProfileFileSchema: Schema.StructWithRest<Schema.Struct<{
    readonly format: Schema.Literal<"alchemy.profile/v1">;
    readonly provider: Schema.String;
    readonly metadata: Schema.$Record<Schema.String, Schema.Unknown>;
    readonly values: Schema.$Record<Schema.String, Schema.Unknown>;
}>, readonly [Schema.$Record<Schema.String, Schema.Unknown>]>;
export type ProviderProfileFile = typeof ProviderProfileFileSchema.Type;
/** Compose the base envelope with a custom provider's typed schemas. */
export declare const makeProviderProfileSchema: <Metadata, Values>(provider: string, metadata: Schema.Codec<Metadata>, values: Schema.Codec<Values>) => Schema.Struct<{
    readonly format: Schema.Literal<"alchemy.profile/v1">;
    readonly provider: Schema.Literal<string>;
    readonly metadata: Schema.Codec<Metadata, Metadata, never, never>;
    readonly values: Schema.Codec<Values, Values, never, never>;
}>;
/**
 * Aggregate view used by the profile UI. It is synthesized from provider
 * files and is never persisted as a central manifest.
 */
export interface Profile {
    readonly id: string;
    readonly providers: Record<string, ProviderConfig>;
}
export interface ProfileManifest {
    readonly version: typeof PROFILE_MANIFEST_VERSION;
    readonly profiles: Record<string, Profile>;
}
export interface ProfileSelection {
    readonly name: string;
    readonly source: "configuration" | "default";
}
declare const ProfileError_base: Schema.Class<ProfileError, Schema.TaggedStruct<"ProfileError", {
    readonly message: Schema.String;
    readonly cause: Schema.optional<Schema.Defect>;
}>, import("effect/Cause").YieldableError>;
export declare class ProfileError extends ProfileError_base {
    readonly [UserFacingError] = true;
}
declare const MissingProviderConfig_base: Schema.Class<MissingProviderConfig, Schema.TaggedStruct<"MissingProviderConfig", {
    readonly provider: Schema.String;
    readonly profileName: Schema.String;
    readonly message: Schema.String;
}>, import("effect/Cause").YieldableError>;
export declare class MissingProviderConfig extends MissingProviderConfig_base {
}
export declare const SuppressMissingProviderConfig: Context.Reference<boolean>;
export declare const createProfileHint: (name?: string) => Effect.Effect<string, never, never>;
export declare const cannotDeleteDefaultProfile: () => ProfileError;
export declare const cannotRenameDefaultProfile: () => ProfileError;
export declare const validateProfileName: (name: string) => Effect.Effect<string, ProfileError>;
export interface ProfileStoreService {
    readonly readManifest: Effect.Effect<ProfileManifest, ProfileError | PlatformError>;
    readonly getProfile: (name: string) => Effect.Effect<Profile | undefined, ProfileError | PlatformError>;
    readonly ensureProfile: (name: string) => Effect.Effect<Profile, ProfileError | PlatformError>;
    readonly createProfile: (name: string) => Effect.Effect<void, ProfileError | PlatformError>;
    readonly renameProfile: (name: string, newName: string) => Effect.Effect<void, ProfileError | PlatformError>;
    readonly current: Effect.Effect<ProfileSelection, ProfileError | PlatformError>;
    readonly setProviderConfig: (profile: string, provider: string, values: ProviderConfig) => Effect.Effect<void, ProfileError | PlatformError>;
    readonly deleteProviderConfig: (profile: string, provider: string) => Effect.Effect<boolean, ProfileError | PlatformError>;
    readonly deleteProfile: (name: string) => Effect.Effect<boolean, ProfileError | PlatformError>;
    readonly loadProviderConfig: <Config extends {
        method: string;
    }>(auth: AuthProvider<Config>, profileName: string) => Effect.Effect<Config, AuthError | MissingProviderConfig | ProfileError | PlatformError>;
}
declare const ProfileStore_base: Context.ServiceClass<ProfileStore, "Alchemy::ProfileStore", ProfileStoreService>;
export declare class ProfileStore extends ProfileStore_base {
}
export declare const ProfileStoreLive: Layer.Layer<ProfileStore, PlatformError, FileSystem.FileSystem | Path.Path>;
/** The name of the currently selected profile. */
export declare const currentProfileName: Effect.Effect<string, ProfileError | PlatformError, ProfileStore>;
//# sourceMappingURL=Profile.d.ts.map