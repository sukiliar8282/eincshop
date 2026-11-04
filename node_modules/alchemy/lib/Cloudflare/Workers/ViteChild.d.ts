import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner";
import { BundleError } from "../../Bundle/Bundle.ts";
import { type ViteBuildChildConfig, type ViteBuildChildResult, type ViteChildConfig } from "./ViteChild.shared.ts";
export interface ViteChildHandle {
    readonly url: URL;
    readonly pid: number;
    readonly exitCode: Effect.Effect<number>;
}
export declare const startViteChild: (config: ViteChildConfig, onOutput: (channel: "stdout" | "stderr", line: string) => Effect.Effect<void>) => Effect.Effect<{
    url: URL;
    pid: ChildProcessSpawner.ProcessId;
    exitCode: Effect.Effect<ChildProcessSpawner.ExitCode, never, never>;
}, import("effect/PlatformError").PlatformError, ChildProcessSpawner.ChildProcessSpawner | import("effect/Scope").Scope>;
/**
 * Run a one-shot production Vite build in a child process whose working
 * directory is the project root, and read back the serialized result.
 *
 * Isolation is the point (the dev server already runs this way): an
 * in-process build both suffers from and causes transient `process.cwd()`
 * changes — cross-spawn `process.chdir`s the hosting process while
 * resolving a spawn's binary, and vite/plugins resolve relative paths
 * against live cwd — which corrupts concurrent deploys sharing the
 * process. See `ViteBuildChildRunner.ts` for the child side.
 */
export declare const runViteBuildChild: (config: Omit<ViteBuildChildConfig, "outputPath">, onOutput: (channel: "stdout" | "stderr", line: string) => Effect.Effect<void>) => Effect.Effect<ViteBuildChildResult, BundleError | import("effect/PlatformError").PlatformError, ChildProcessSpawner.ChildProcessSpawner | FileSystem.FileSystem | Path.Path>;
//# sourceMappingURL=ViteChild.d.ts.map