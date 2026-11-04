/**
 * INTERNAL — deterministic identity for a Docker build: context + Dockerfile
 * + platform + build args, with Docker's own semantics (`.dockerignore`
 * pattern matching, symlink targets, permission bits, empty directories).
 * Cloud-agnostic — consumed by `AWS.ECR.Image` and `AWS.Lambda.Function`
 * image packaging; NOT exported from the Docker barrel.
 */
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
export interface DockerBuildSource {
    context: string;
    dockerfile: string;
    platform: string;
    buildArgs?: Record<string, string>;
}
export type DockerBuildHashMode = "all" | "effective";
/**
 * Resolve and validate a Docker build context and Dockerfile.
 *
 * Dockerfile paths are relative to the build context unless absolute.
 */
export declare const resolveDockerBuildPaths: (source: Pick<DockerBuildSource, "context" | "dockerfile">) => Effect.Effect<{
    context: string;
    dockerfile: string;
}, Error | import("effect/PlatformError").PlatformError, FileSystem.FileSystem | Path.Path>;
/**
 * Select the effective files sent for a Docker build.
 *
 * Dockerfile-specific ignore files take precedence over `.dockerignore`.
 * The Dockerfile and selected ignore file stay in the upload even when an
 * ignore rule matches them, as Docker clients must send both to the builder.
 */
export declare const selectDockerBuildContext: (source: Pick<DockerBuildSource, "context" | "dockerfile">) => Effect.Effect<{
    context: string;
    dockerfile: string;
    dockerfilePath: string | undefined;
    includes: (relativePath: string) => boolean;
}, Error | import("effect/PlatformError").PlatformError, FileSystem.FileSystem | Path.Path>;
/**
 * Hash a Docker build context together with the Dockerfile, platform, and
 * build arguments. In `effective` mode, the selected `.dockerignore` is
 * applied exactly once before files are hashed. Absolute paths do not
 * participate.
 */
export declare const hashDockerBuildInputs: (source: DockerBuildSource, mode: DockerBuildHashMode) => Effect.Effect<string, Error | import("effect/PlatformError").PlatformError, FileSystem.FileSystem | Path.Path>;
//# sourceMappingURL=BuildHash.d.ts.map