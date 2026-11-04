/**
 * Gzipped ustar of a directory. Used to upload a generated Docker
 * context (Railway `/up`, and any other gzip-tarball consumer).
 */
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
/**
 * Pack `root` into a gzipped tar (ustar + GNU long-name). Paths are
 * relative to `root` with POSIX separators.
 */
export declare const tarGzipDirectory: (root: string, options?: {
    preserveMode?: boolean;
} | undefined) => Effect.Effect<NonSharedBuffer, unknown, FileSystem.FileSystem | Path.Path>;
//# sourceMappingURL=tarGzip.d.ts.map