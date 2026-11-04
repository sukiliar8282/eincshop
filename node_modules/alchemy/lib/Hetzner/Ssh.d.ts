import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Path from "effect/Path";
import * as Redacted from "effect/Redacted";
import type * as Scope from "effect/Scope";
import * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner";
import * as Binding from "../Binding.ts";
import type { Server } from "./Server.ts";
declare const SshError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Hetzner.SshError";
} & Readonly<A>;
export declare class SshError extends SshError_base<{
    message: string;
    host?: string;
    command?: string;
    code?: number;
    stderr?: string;
}> {
}
export interface SshExecResult {
    stdout: string;
    stderr: string;
    code: number;
}
export interface SshOptions {
    /** SSH user. @default "root" */
    user?: string;
    /** PKCS8 PEM private key. Defaults to the Server's deploy key. */
    privateKey?: string | Redacted.Redacted<string>;
}
export type SshServices = FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner | Scope.Scope;
export interface SshClient {
    exec: (command: string) => Effect.Effect<SshExecResult, SshError, SshServices>;
    scp: (local: string | Uint8Array<ArrayBufferLike>, remote: string) => Effect.Effect<void, SshError, SshServices>;
}
/**
 * SSH exec/scp against a Hetzner Server. Uses the Server's Alchemy-managed
 * deploy key (injected at create) unless `privateKey` is passed.
 *
 * ### Remote access
 * **Example:** Exec a command
 * ```typescript
 * const ssh = yield* Hetzner.Ssh(server);
 * const { stdout } = yield* ssh.exec("uname -a");
 * ```
 *
 * **Example:** Copy a file
 * ```typescript
 * const ssh = yield* Hetzner.Ssh(server);
 * yield* ssh.scp("/tmp/app.zip", "/opt/app/bundle.zip");
 * ```
 *
 * @binding
 */
export interface Ssh extends Binding.Service<Ssh, "Hetzner.Ssh", (server: Server, options?: SshOptions) => Effect.Effect<SshClient, SshError, SshServices>> {
}
export declare const Ssh: Ssh;
/**
 * Open an SSH session against `host` with the given private key. Writes
 * the key to a temp file (mode 0600) for `ssh`/`scp`.
 */
export declare const openSshClient: (input: {
    host: string;
    privateKey: string;
    user?: string;
}) => Effect.Effect<{
    exec: (command: string) => Effect.Effect<{
        code: number;
        stdout: string;
        stderr: string;
    }, SshError, ChildProcessSpawner.ChildProcessSpawner | Scope.Scope>;
    scp: (local: string | Uint8Array<ArrayBufferLike>, remote: string) => Effect.Effect<undefined, SshError, ChildProcessSpawner.ChildProcessSpawner | Scope.Scope>;
    close: Effect.Effect<void, never, never>;
}, import("effect/PlatformError").PlatformError, ChildProcessSpawner.ChildProcessSpawner | FileSystem.FileSystem | Path.Path | Scope.Scope>;
export declare const sshClientForServer: (server: Server, options?: SshOptions | undefined) => Effect.Effect<{
    exec: (command: string) => Effect.Effect<{
        code: number;
        stdout: string;
        stderr: string;
    }, SshError, ChildProcessSpawner.ChildProcessSpawner | Scope.Scope>;
    scp: (local: string | Uint8Array<ArrayBufferLike>, remote: string) => Effect.Effect<undefined, SshError, ChildProcessSpawner.ChildProcessSpawner | Scope.Scope>;
    close: Effect.Effect<void, never, never>;
}, SshError, ChildProcessSpawner.ChildProcessSpawner | FileSystem.FileSystem | Path.Path | Scope.Scope>;
export declare const SshLive: Layer.Layer<Ssh, never, never>;
export {};
//# sourceMappingURL=Ssh.d.ts.map