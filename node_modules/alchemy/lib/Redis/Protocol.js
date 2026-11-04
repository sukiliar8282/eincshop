import * as Effect from "effect/Effect";
import * as Queue from "effect/Queue";
import * as Scope from "effect/Scope";
import * as Semaphore from "effect/Semaphore";
import { CommandError, ProtocolError } from "./Errors.js";
import { encodeCommand, Parser } from "./Resp.js";
export const DEFAULT_PORT = 6379;
export const TLS_PORT = 6380;
/** Parse a `redis://` or `rediss://` URL. */
export const parseUrl = (url) => {
    const parsed = new URL(url);
    const tls = parsed.protocol === "rediss:";
    const path = parsed.pathname.startsWith("/")
        ? parsed.pathname.slice(1)
        : parsed.pathname;
    const dbRaw = path.length === 0 ? undefined : Number(path);
    return {
        hostname: parsed.hostname,
        port: Number(parsed.port || (tls ? TLS_PORT : DEFAULT_PORT)),
        tls,
        username: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password),
        db: dbRaw !== undefined && Number.isInteger(dbRaw) && dbRaw >= 0
            ? dbRaw
            : undefined,
    };
};
/** Build a `redis://` URL. Encodes the password. Used by tests and TcpProxy. */
export const connectionUrl = (input) => {
    const username = input.username ?? "default";
    const scheme = input.tls ? "rediss" : "redis";
    const db = input.db !== undefined ? `/${input.db}` : "";
    return `${scheme}://${username}:${encodeURIComponent(input.password)}@${input.host}:${input.port}${db}`;
};
const commandError = (command, cause) => cause instanceof CommandError
    ? new CommandError({ command, cause: cause.cause })
    : new CommandError({ command, cause });
const asBytes = (data) => new Uint8Array(data);
const writeSocket = (socket, bytes) => {
    const written = socket.write(bytes);
    if (typeof written === "object" && written !== null && "then" in written) {
        return Effect.tryPromise({
            try: () => Promise.resolve(written),
            catch: (cause) => commandError("WRITE", cause),
        }).pipe(Effect.asVoid);
    }
    return Effect.void;
};
const openBun = (options, events) => Effect.callback((resume, signal) => {
    let settled = false;
    let socket;
    const succeed = (value) => {
        if (settled)
            return;
        settled = true;
        resume(Effect.succeed(value));
    };
    const fail = (cause) => {
        if (settled) {
            Queue.offerUnsafe(events, { _tag: "Fail", cause });
            return;
        }
        settled = true;
        resume(Effect.fail(commandError("CONNECT", cause)));
    };
    const Client = globalThis
        .Bun;
    if (Client === undefined) {
        fail(new Error("Bun.connect is not available"));
        return;
    }
    Client.connect({
        hostname: options.hostname,
        port: options.port,
        tls: options.tls,
        socket: {
            binaryType: "uint8array",
            open: (opened) => {
                socket = opened;
                succeed(opened);
            },
            data: (_opened, chunk) => {
                Queue.offerUnsafe(events, {
                    _tag: "Data",
                    bytes: asBytes(chunk),
                });
            },
            error: (_opened, cause) => fail(cause),
            connectError: (_opened, cause) => fail(cause),
            close: () => {
                Queue.offerUnsafe(events, { _tag: "End" });
            },
            end: () => {
                Queue.offerUnsafe(events, { _tag: "End" });
            },
        },
    }).catch(fail);
    const abort = () => {
        socket?.end();
    };
    signal.addEventListener("abort", abort, { once: true });
    return Effect.sync(() => {
        signal.removeEventListener("abort", abort);
        abort();
    });
});
const openNode = (options, events) => Effect.callback((resume, signal) => {
    let settled = false;
    let socket;
    const succeed = (value) => {
        if (settled)
            return;
        settled = true;
        resume(Effect.succeed(value));
    };
    const fail = (cause) => {
        if (settled) {
            Queue.offerUnsafe(events, { _tag: "Fail", cause });
            return;
        }
        settled = true;
        resume(Effect.fail(commandError("CONNECT", cause)));
    };
    const attach = (nodeSocket, ready) => {
        socket = nodeSocket;
        nodeSocket.on(ready, () => succeed({
            write: (bytes) => {
                nodeSocket.write(bytes);
                return bytes.length;
            },
            end: () => {
                nodeSocket.end();
            },
        }));
        nodeSocket.on("data", (chunk) => {
            Queue.offerUnsafe(events, { _tag: "Data", bytes: asBytes(chunk) });
        });
        nodeSocket.on("error", fail);
        nodeSocket.on("close", () => {
            Queue.offerUnsafe(events, { _tag: "End" });
        });
    };
    const start = options.tls
        ? import("node:tls").then((tls) => attach(tls.connect({
            host: options.hostname,
            port: options.port,
            servername: options.hostname,
        }), "secureConnect"))
        : import("node:net").then((net) => attach(net.connect({ host: options.hostname, port: options.port }), "connect"));
    start.catch(fail);
    const abort = () => {
        socket?.end();
    };
    signal.addEventListener("abort", abort, { once: true });
    return Effect.sync(() => {
        signal.removeEventListener("abort", abort);
        abort();
    });
});
const openRaw = (options, events) => typeof Bun !== "undefined"
    ? openBun(options, events)
    : openNode(options, events);
const unwrap = (frame, command) => {
    if (frame._tag === "Protocol") {
        return Effect.fail(commandError(command, frame.error));
    }
    if (frame._tag === "Error") {
        return Effect.fail(commandError(command, frame.error));
    }
    if (frame._tag === "Push") {
        return Effect.succeed(frame.value);
    }
    return Effect.succeed(frame.value);
};
const expectStatus = (reply, command) => {
    if (typeof reply === "string" && reply.toUpperCase() === "OK") {
        return Effect.void;
    }
    return Effect.fail(commandError(command, new ProtocolError({ message: `expected OK, got ${String(reply)}` })));
};
const readReplies = (events, parser, count, command) => Effect.gen(function* () {
    const replies = [];
    while (replies.length < count) {
        const event = yield* Queue.take(events);
        if (event._tag === "Fail") {
            return yield* Effect.fail(commandError(command, event.cause));
        }
        if (event._tag === "End") {
            return yield* Effect.fail(commandError(command, new ProtocolError({ message: "connection closed" })));
        }
        parser.push(event.bytes);
        while (replies.length < count) {
            const frame = parser.next();
            if (frame._tag === "Incomplete")
                break;
            if (frame._tag === "Push")
                continue;
            replies.push(yield* unwrap(frame, command));
        }
    }
    return replies;
});
/**
 * Open an authenticated Redis session. Closes when the ambient Scope
 * is released. Concurrent `send`/`pipeline` calls on one connection
 * are serialized so replies stay ordered.
 */
export const connect = (url) => Effect.gen(function* () {
    const options = yield* Effect.try({
        try: () => parseUrl(url),
        catch: (cause) => commandError("CONNECT", cause),
    });
    const events = yield* Queue.unbounded();
    const socket = yield* Effect.acquireRelease(openRaw(options, events), (opened) => Effect.sync(() => {
        opened.end();
    }).pipe(Effect.flatMap(() => Queue.shutdown(events)), Effect.asVoid));
    const parser = new Parser();
    const lock = yield* Semaphore.make(1);
    const request = (payload, count, command) => lock.withPermit(Effect.gen(function* () {
        yield* writeSocket(socket, payload);
        return yield* readReplies(events, parser, count, command);
    }));
    if (options.password.length > 0) {
        const authArgs = options.username.length > 0 && options.username !== "default"
            ? [options.username, options.password]
            : [options.password];
        const replies = yield* request(encodeCommand("AUTH", authArgs), 1, "AUTH");
        yield* expectStatus(replies[0] ?? null, "AUTH");
    }
    if (options.db !== undefined && options.db !== 0) {
        const replies = yield* request(encodeCommand("SELECT", [options.db]), 1, "SELECT");
        yield* expectStatus(replies[0] ?? null, "SELECT");
    }
    return {
        send: (command, args = []) => request(encodeCommand(command, args), 1, command).pipe(Effect.map((replies) => replies[0] ?? null)),
        pipeline: (commands) => {
            if (commands.length === 0)
                return Effect.succeed([]);
            const chunks = commands.map(([name, ...args]) => encodeCommand(name, args));
            let total = 0;
            for (const chunk of chunks)
                total += chunk.length;
            const payload = new Uint8Array(total);
            let offset = 0;
            for (const chunk of chunks) {
                payload.set(chunk, offset);
                offset += chunk.length;
            }
            return request(payload, commands.length, commands[0]?.[0] ?? "PIPELINE");
        },
    };
});
const scoped = (command, effect) => Effect.scoped(effect).pipe(Effect.mapError((error) => commandError(command, error)));
/**
 * Send one Redis command over RESP and close the connection.
 */
export const run = (url, command, args = []) => scoped(command, Effect.gen(function* () {
    const connection = yield* connect(url);
    return yield* connection.send(command, args);
}));
/**
 * Pipeline several commands on one connection, then close it.
 */
export const pipeline = (url, commands) => scoped(commands[0]?.[0] ?? "PIPELINE", Effect.gen(function* () {
    const connection = yield* connect(url);
    return yield* connection.pipeline(commands);
}));
export const command = (url, name, args = []) => Effect.gen(function* () {
    const resolved = yield* url;
    return yield* run(resolved, name, args);
});
export const commandPipeline = (url, commands) => Effect.gen(function* () {
    const resolved = yield* url;
    return yield* pipeline(resolved, commands);
});
//# sourceMappingURL=Protocol.js.map