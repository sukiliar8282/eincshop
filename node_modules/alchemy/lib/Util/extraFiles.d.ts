/**
 * Extra files packed next to a Fly/Hetzner/Railway program (Docker
 * context or unit zip).
 *
 * `dest: "."` means "this directory IS the image/unit root" (`COPY . /app`),
 * not a subfolder. {@link contextRootOf} then treats that source as the
 * context, and {@link posixRelUnder} places `main` relative to it so
 * `isExternal` ENTRYPOINT is `node /app/serve-node.mjs` instead of
 * bundling `index.mjs`. Hashing skips gitignore (a parent `dist` rule
 * would empty the hash) but still excludes `node_modules` / `.git` /
 * `.next/cache` / `.alchemy` so the glob stays bounded.
 */
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
/** Extra-file dest that means "merge this directory into the image/unit root". */
export declare const CONTEXT_ROOT_DEST = ".";
export declare const isContextRootDest: (dest: string) => boolean;
/**
 * Hash extra-file trees without gitignore (a parent `dist` rule would
 * empty the hash) but skip the directories that make a recursive glob
 * unbounded.
 */
export declare const EXTRA_FILES_HASH_EXCLUDE: string[];
/**
 * Extra file or directory copied next to a bundled program (Docker
 * context, unit archive, …). `dest` is relative to the image/unit root.
 */
export interface ExtraFile {
    /** Local file or directory (absolute, or relative to {@link initialCwd}). */
    readonly source: string;
    /**
     * Destination relative to the image/unit root (e.g. `"dist"`, `".next"`).
     * `"."` means merge into the root.
     */
    readonly dest: string;
}
/**
 * Path of `file` relative to `root`, POSIX. Empty string if they are the
 * same directory. Returns `undefined` when `file` is not under `root`.
 */
export declare const posixRelUnder: (root: string, file: string, path: {
    readonly resolve: (...segments: string[]) => string;
    readonly relative: (from: string, to: string) => string;
    readonly isAbsolute: (value: string) => boolean;
}) => string | undefined;
/**
 * Docker/zip context root for an unbundled (`isExternal`) program. If
 * some extraFile is `dest: "."`, that source is the context; otherwise
 * the context is `dirname(main)`.
 */
export declare const contextRootOf: (main: string, extraFiles: ReadonlyArray<{
    source: string;
    dest: string;
}>, path: Path.Path, resolveSource: (source: string) => string) => string;
/** Normalize a COPY destination so it cannot escape the root. `"."` is the root. */
export declare const extraFileDestination: (destination: string) => string;
export declare const resolveExtraSource: (source: string, path: {
    readonly isAbsolute: (value: string) => boolean;
    readonly resolve: (...segments: string[]) => string;
}) => string;
export declare const hashExtraFiles: (extraFiles: readonly ExtraFile[] | undefined) => Effect.Effect<Record<string, string>, import("effect/PlatformError").PlatformError, FileSystem.FileSystem | Path.Path>;
/**
 * Copy a file or directory without macOS `clonefile`. Nitro/Nuxt
 * `.output/server` trees (and their nested `node_modules`) fail
 * `fs.copy` with `EINVAL: invalid argument, clonefile`. Nested
 * `node_modules` are copied — nitro's node preset emits runtime
 * deps there (`solid-js`, `seroval`, …) and the host imports them.
 */
export declare const copyTree: (from: string, to: string) => Effect.Effect<void, import("effect/PlatformError").PlatformError, FileSystem.FileSystem | Path.Path>;
export declare const copyExtraFiles: (contextDir: string, extraFiles: readonly ExtraFile[] | undefined, options?: {
    readonly onMissing?: (file: {
        readonly source: string;
        readonly dest: string;
    }) => Effect.Effect<unknown, any>;
} | undefined) => Effect.Effect<void, any, FileSystem.FileSystem | Path.Path>;
//# sourceMappingURL=extraFiles.d.ts.map