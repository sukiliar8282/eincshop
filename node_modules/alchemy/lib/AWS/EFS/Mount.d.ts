import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.ts";
import type { AccessPoint } from "./AccessPoint.ts";
import type { FileSystem } from "./FileSystem.ts";
/**
 * Options for {@link Mount}.
 */
export interface MountOptions {
    /**
     * Local path the file system is mounted at inside the compute environment.
     * On Lambda the path must begin with `/mnt/` (e.g. `/mnt/data`); on ECS any
     * absolute container path works.
     */
    path: string;
    /**
     * Mount read-only: the role is granted `elasticfilesystem:ClientMount`
     * only (no `ClientWrite`), and on ECS the container mount point is marked
     * `readOnly`.
     * @default false
     */
    readOnly?: boolean;
}
/**
 * The runtime view of a mounted EFS file system: the local path it is
 * available at inside the running Function/Task.
 */
export interface MountedFileSystem {
    /** The local mount path (same value as {@link MountOptions.path}). */
    path: string;
}
/**
 * Host-agnostic EFS mount binding.
 *
 * `yield* EFS.mount(accessPoint, { path: "/mnt/data" })` inside a compute
 * body wires the file system into whatever host the code deploys to:
 *
 * - **Lambda** — injects a `FileSystemConfigs` entry (the access point ARN +
 *   local mount path) through the Function's binding channel and grants the
 *   execution role `elasticfilesystem:ClientMount`/`ClientWrite` scoped to
 *   the access point. Lambda requires an `AWS.EFS.AccessPoint` (not a bare
 *   file system) and a `/mnt/…` path, and the Function must have `vpc` set
 *   to subnets that can reach an EFS mount target.
 * - **ECS Task** — injects a task-level EFS volume (transit encryption on,
 *   IAM auth on, access-point scoped when one is given) plus a container
 *   mount point, and grants the task role the matching client actions.
 *
 * Provide the `EFS.MountLive` layer on the Function/Task Effect to satisfy
 * the binding. Mount targets for the file system's VPC/subnets must already
 * exist (`AWS.EFS.MountTarget`).
 *
 * @binding
 */
export interface Mount extends Binding.Service<Mount, "AWS.EFS.Mount", (target: AccessPoint | FileSystem, options: MountOptions) => Effect.Effect<MountedFileSystem>> {
}
export declare const Mount: Mount;
/**
 * Ergonomic alias of {@link Mount} — `yield* EFS.mount(accessPoint, { path })`.
 */
export declare const mount: Mount;
/**
 * Host-agnostic implementation of the {@link Mount} binding. Detects the
 * host (Lambda Function vs ECS Task) at deploy time and registers the
 * host-appropriate mount config + IAM through the binding channel; at
 * runtime it is a no-op that returns the mount path.
 */
export declare const MountLive: Layer.Layer<Mount, never, never>;
//# sourceMappingURL=Mount.d.ts.map