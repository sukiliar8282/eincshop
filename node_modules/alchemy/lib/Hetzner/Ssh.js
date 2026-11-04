import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Path from "effect/Path";
import * as Redacted from "effect/Redacted";
import * as Stream from "effect/Stream";
import * as ChildProcess from "effect/unstable/process/ChildProcess";
import * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner";
import * as Binding from "../Binding.js";
export class SshError extends Data.TaggedError("Hetzner.SshError") {
}
export const Ssh = Binding.Service("Hetzner.Ssh");
const unwrapKey = (value) => {
    if (value === undefined || value === null)
        return undefined;
    if (typeof value === "string")
        return value;
    if (Redacted.isRedacted(value)) {
        const inner = Redacted.value(value);
        return typeof inner === "string" ? inner : undefined;
    }
    return undefined;
};
const ipv4Of = (server) => {
    const value = server.ipv4;
    return typeof value === "string" && value.length > 0 ? value : undefined;
};
const sshArgs = (keyPath) => [
    "-i",
    keyPath,
    "-o",
    "StrictHostKeyChecking=no",
    "-o",
    "UserKnownHostsFile=/dev/null",
    "-o",
    "IdentitiesOnly=yes",
    "-o",
    "BatchMode=yes",
    "-o",
    "ConnectTimeout=10",
    "-o",
    "LogLevel=ERROR",
];
const runCommand = Effect.fn(function* (input) {
    const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
    const result = yield* ChildProcess.make(input.bin, input.args, {
        stdin: "ignore",
        stdout: "pipe",
        stderr: "pipe",
        detached: false,
    }).pipe(spawner.spawn, Effect.flatMap((child) => Effect.all({
        exitCode: child.exitCode,
        stdout: child.stdout.pipe(Stream.decodeText, Stream.mkString),
        stderr: child.stderr.pipe(Stream.decodeText, Stream.mkString),
    }, { concurrency: "unbounded" })), Effect.mapError((error) => new SshError({
        message: `ssh spawn failed: ${String(error)}`,
        host: input.host,
        command: input.command,
    })));
    return {
        code: Number(result.exitCode),
        stdout: result.stdout,
        stderr: result.stderr,
    };
});
/**
 * Open an SSH session against `host` with the given private key. Writes
 * the key to a temp file (mode 0600) for `ssh`/`scp`.
 */
export const openSshClient = Effect.fn(function* (input) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const user = input.user ?? "root";
    const dest = `${user}@${input.host}`;
    const dir = yield* fs.makeTempDirectory({ prefix: "alchemy-hetzner-ssh-" });
    const keyPath = path.join(dir, "id");
    yield* fs.writeFileString(keyPath, input.privateKey);
    yield* fs.chmod(keyPath, 0o600);
    yield* runCommand({
        bin: "chmod",
        args: ["600", keyPath],
        host: input.host,
        command: `chmod 600 ${keyPath}`,
    }).pipe(Effect.ignore);
    const close = fs.remove(dir, { recursive: true }).pipe(Effect.ignore);
    const exec = (command) => runCommand({
        bin: "ssh",
        args: [...sshArgs(keyPath), dest, command],
        host: input.host,
        command,
    }).pipe(Effect.flatMap((result) => result.code === 0
        ? Effect.succeed(result)
        : Effect.fail(new SshError({
            message: `ssh exited ${result.code}: ${[result.stderr, result.stdout]
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
                .join("\n") || "no output"}`,
            host: input.host,
            command,
            code: result.code,
            stderr: result.stderr,
        }))));
    const toSshError = (error) => error instanceof SshError
        ? error
        : new SshError({
            message: `ssh failed: ${String(error)}`,
            host: input.host,
        });
    const scp = (local, remote) => Effect.gen(function* () {
        let localPath;
        let staged;
        if (typeof local === "string") {
            localPath = local;
        }
        else {
            const stamp = yield* Effect.sync(() => crypto.randomUUID());
            staged = path.join(dir, `payload-${stamp}`);
            yield* fs.writeFile(staged, local);
            localPath = staged;
        }
        const slash = remote.lastIndexOf("/");
        if (slash > 0) {
            const remoteDir = remote.slice(0, slash);
            yield* exec(`mkdir -p ${JSON.stringify(remoteDir)}`);
        }
        const result = yield* runCommand({
            bin: "scp",
            args: [...sshArgs(keyPath), localPath, `${dest}:${remote}`],
            host: input.host,
            command: `scp ${localPath} ${remote}`,
        });
        if (staged !== undefined) {
            yield* fs.remove(staged, { force: true }).pipe(Effect.ignore);
        }
        if (result.code !== 0) {
            return yield* new SshError({
                message: `scp exited ${result.code}`,
                host: input.host,
                command: `scp ${remote}`,
                code: result.code,
                stderr: result.stderr,
            });
        }
    }).pipe(Effect.mapError(toSshError));
    return { exec, scp, close };
});
export const sshClientForServer = Effect.fn(function* (server, options) {
    const host = ipv4Of(server);
    if (host === undefined) {
        return yield* new SshError({
            message: `Server '${server.LogicalId}' has no public IPv4 address`,
        });
    }
    const privateKey = unwrapKey(options?.privateKey) ??
        unwrapKey(server.privateKey);
    if (privateKey === undefined) {
        return yield* new SshError({
            message: `Server '${server.LogicalId}' has no deploy SSH private key`,
            host,
        });
    }
    return yield* openSshClient({
        host,
        privateKey,
        user: options?.user,
    }).pipe(Effect.mapError((error) => error instanceof SshError
        ? error
        : new SshError({
            message: `ssh failed: ${String(error)}`,
            host,
        })));
});
export const SshLive = Layer.effect(Ssh, Effect.succeed(Effect.fn(function* (server, options) {
    const session = yield* sshClientForServer(server, options);
    return {
        exec: session.exec,
        scp: session.scp,
    };
})));
//# sourceMappingURL=Ssh.js.map