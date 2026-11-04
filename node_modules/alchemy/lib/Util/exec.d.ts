import * as Effect from "effect/Effect";
import type { ChildProcess } from "effect/unstable/process";
export declare const exec: (command: ChildProcess.Command) => Effect.Effect<{
    exitCode: import("effect/unstable/process/ChildProcessSpawner").ExitCode;
    stdout: string;
    stderr: string;
}, import("effect/PlatformError").PlatformError, import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | import("effect/Scope").Scope>;
//# sourceMappingURL=exec.d.ts.map