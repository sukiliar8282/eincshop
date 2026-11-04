import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import type { ChildProcessSpawner } from "effect/unstable/process/ChildProcessSpawner";
import { BundleError } from "./Bundle.ts";
export interface InstalledPackageFile {
    readonly path: string;
    readonly content: Uint8Array<ArrayBufferLike>;
    /** Complete Unix mode, including the file type bits. */
    readonly mode?: number;
}
export type PackageInstall = ReadonlyArray<string> | Readonly<Record<string, string>>;
export type NpmInstallRunner = (directory: string, args: ReadonlyArray<string>) => Effect.Effect<void, unknown>;
export interface ResolveInstallTargetsOptions {
    readonly cwd: string;
    /** Normalized package-root → requested version map (from {@link normalizeInstallTargets}). */
    readonly requested: Readonly<Record<string, string>>;
}
export type PackageOverride = string | PackageOverrideMap;
export interface PackageOverrideMap {
    readonly [dependencyName: string]: PackageOverride;
}
export type PackageOverrides = Readonly<Record<string, PackageOverride>>;
export interface PackageInstallPlan {
    readonly resolved: Readonly<Record<string, string>>;
    readonly overrides: PackageOverrides;
}
export interface PackageInstallIdentity extends PackageInstallPlan {
    readonly lockfile?: {
        readonly name: string;
        readonly hash: string;
    };
}
export interface HashPackageInstallIdentityOptions {
    readonly bundleHash: string;
    readonly identity: PackageInstallIdentity;
    readonly architecture: "x86_64" | "arm64";
}
export interface InstallResolvedPackagesOptions {
    /** Package-root → concrete npm version map (from {@link resolveInstallTargets}). */
    readonly resolved: Readonly<Record<string, string>>;
    /** Locked parent-package → child-package versions used to pin transitives. */
    readonly overrides?: PackageOverrides;
    readonly architecture: "x86_64" | "arm64";
    readonly runNpmInstall?: NpmInstallRunner;
}
export interface InstallPackagesOptions {
    readonly cwd: string;
    readonly install?: PackageInstall;
    readonly architecture: "x86_64" | "arm64";
    readonly runNpmInstall?: NpmInstallRunner;
}
/**
 * Parses a module specifier into its package root, or `undefined` when the
 * specifier is not a bare package import (relative path, builtin, glob, subpath
 * imports, etc.).
 */
export declare function parsePackageRoot(specifier: string): string | undefined;
/**
 * Parses a bare package specifier or subpath import into its package root.
 */
export declare function parsePackageRootFromSpecifier(specifier: string): string | undefined;
/** Whether `moduleId` is `root` itself or a subpath import of it. */
export declare function matchesPackageRoot(moduleId: string, root: string): boolean;
export declare function npmInstallArgs(architecture: "x86_64" | "arm64"): ReadonlyArray<string>;
export declare function npmLockfileArgs(architecture: "x86_64" | "arm64"): ReadonlyArray<string>;
export declare function npmPlainInstallArgs(architecture: "x86_64" | "arm64"): ReadonlyArray<string>;
/**
 * Normalizes and validates a `build.install` declaration to a
 * package-root → requested-version map. Array entries default to `"*"`.
 */
export declare function normalizeInstallTargets(install: PackageInstall | undefined): Effect.Effect<Record<string, string>, BundleError>;
/**
 * Resolves the npm-compatible version for every requested package, reading the
 * nearest source `package.json` and pnpm/Bun catalogs. Does not run npm.
 */
export declare function resolveInstallTargets(options: ResolveInstallTargetsOptions): Effect.Effect<Record<string, string>, BundleError, FileSystem.FileSystem | Path.Path | ChildProcessSpawner>;
export declare function resolvePackageInstallPlan(options: ResolveInstallTargetsOptions): Effect.Effect<PackageInstallPlan, BundleError, FileSystem.FileSystem | Path.Path | ChildProcessSpawner>;
/**
 * Resolves the package install identity used by Lambda diffing. The lockfile
 * fingerprint makes range-preserving dependency updates trigger a new artifact.
 */
export declare function resolvePackageInstallIdentity(options: ResolveInstallTargetsOptions): Effect.Effect<PackageInstallIdentity, BundleError, FileSystem.FileSystem | Path.Path | ChildProcessSpawner>;
export declare function hashPackageInstallIdentity(options: HashPackageInstallIdentityOptions): Effect.Effect<string>;
/**
 * Installs already-resolved dependencies into an isolated npm artifact targeting
 * Linux and the function's architecture, returning the artifact's files.
 */
export declare function installResolvedPackages(options: InstallResolvedPackagesOptions): Effect.Effect<ReadonlyArray<InstalledPackageFile>, BundleError, FileSystem.FileSystem | Path.Path | ChildProcessSpawner>;
/**
 * Convenience flow for callers that do not need to defer installation.
 */
export declare function installPackages(options: InstallPackagesOptions): Effect.Effect<ReadonlyArray<InstalledPackageFile>, BundleError, FileSystem.FileSystem | Path.Path | ChildProcessSpawner>;
//# sourceMappingURL=InstalledPackages.d.ts.map