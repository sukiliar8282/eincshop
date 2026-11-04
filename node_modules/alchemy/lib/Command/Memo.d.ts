import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import type { PlatformError } from "effect/PlatformError";
/**
 * Controls which files are included in the content hash that determines
 * whether a build needs to re-run.
 *
 * By default (no options), every non-gitignored file in the working directory
 * is hashed, plus the nearest package-manager lockfile. Provide explicit
 * `include`/`exclude` globs to narrow the scope when the default is too broad.
 */
export interface MemoOptions {
    /**
     * Glob patterns of files to hash. Paths are relative to the working
     * directory and may reach outside it with `../` segments — useful in a
     * monorepo where the build consumes sibling workspace packages that the
     * default (files under the working directory) does not cover.
     *
     * Note: providing `include` (or `exclude`) flips the {@link lockfile}
     * default to `false` — pair it with `lockfile: true` to keep rebuilding
     * when dependencies change.
     *
     * @default ["**\/*"] (all files, filtered by `exclude`)
     * @example ["src/**", "package.json", "tsconfig.json"]
     * @example ["**\/*", "../env/src/**"] (also rebuild when a sibling workspace package changes)
     */
    include?: string[];
    /**
     * Glob patterns to exclude from hashing. Paths are relative to the working directory.
     *
     * @default gitignore rules collected from the working directory up to the repo root
     */
    exclude?: string[];
    /**
     * Whether to include the nearest package-manager lockfile (`bun.lock`,
     * `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock`) in the hash,
     * even when it lives above the working directory (e.g. monorepo root).
     *
     * @default true when both `include` and `exclude` are unset; false otherwise
     */
    lockfile?: boolean;
}
/**
 * Produces a deterministic SHA-256 hash of all files matched by the given
 * memo options. The hash changes if and only if the content of the matched
 * files changes, making it suitable for cache-busting build outputs.
 */
export declare const hashDirectory: (props: {
    cwd?: string;
    memo?: MemoOptions;
}) => Effect.Effect<string, PlatformError, FileSystem.FileSystem | Path.Path>;
//# sourceMappingURL=Memo.d.ts.map