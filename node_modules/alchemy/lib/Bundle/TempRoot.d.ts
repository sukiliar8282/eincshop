import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import { Stack } from "../Stack.ts";
import { Stage } from "../Stage.ts";
/**
 * Resolve a bundle entrypoint (`main`) to a real filesystem path.
 *
 * `main` is user-supplied and is very commonly `import.meta.url` — a
 * `file://` URL — which `FileSystem.realPath` cannot `lstat` directly
 * (it would try to stat a literal `file:` path). Convert any `file://`
 * URL to a path first, then resolve to the canonical real path.
 */
export declare const resolveMainPath: (main: string) => Effect.Effect<string, import("effect/PlatformError").PlatformError, FileSystem.FileSystem | Path.Path>;
/**
 * Creates a unique bundle staging directory under the nearest package-local
 * `.alchemy/tmp` root. Each invocation gets its own directory (via a random
 * nonce) so concurrent bundle operations for the same resource never collide.
 * Stale directories from previous crashed runs are cleaned up best-effort.
 */
export declare const createTempBundleDir: (entry: string, dotAlchemy: string, id: string) => Effect.Effect<string, import("effect/PlatformError").PlatformError, FileSystem.FileSystem | Path.Path | Stack | Stage>;
/**
 * Returns a deterministic bundle staging directory without clearing it first.
 * Useful for Docker build contexts where keeping the directory stable avoids
 * unnecessary file churn between builds.
 */
export declare const getStableContextDir: (entry: string, dotAlchemy: string, id: string) => Effect.Effect<string, import("effect/PlatformError").PlatformError, FileSystem.FileSystem | Path.Path | Stack | Stage>;
/**
 * Cleans up a bundle's private temp directory.
 */
export declare const cleanupBundleTempDir: (tempDir: string) => Effect.Effect<void, never, FileSystem.FileSystem>;
export declare const findCwdForBundle: (entry: string) => Effect.Effect<string, import("effect/PlatformError").PlatformError, FileSystem.FileSystem | Path.Path>;
//# sourceMappingURL=TempRoot.d.ts.map