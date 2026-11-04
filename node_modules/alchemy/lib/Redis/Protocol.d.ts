import * as Effect from "effect/Effect";
import * as Scope from "effect/Scope";
import type { RuntimeContext } from "../RuntimeContext.ts";
import { CommandError, type UrlMissing } from "./Errors.ts";
import { type Arg, type Reply } from "./Resp.ts";
export declare const DEFAULT_PORT = 6379;
export declare const TLS_PORT = 6380;
export interface RedisUrl {
    readonly hostname: string;
    readonly port: number;
    readonly tls: boolean;
    readonly username: string;
    readonly password: string;
    readonly db: number | undefined;
}
/** Parse a `redis://` or `rediss://` URL. */
export declare const parseUrl: (url: string) => RedisUrl;
/** Build a `redis://` URL. Encodes the password. Used by tests and TcpProxy. */
export declare const connectionUrl: (input: {
    host: string;
    port: number;
    password: string;
    username?: string;
    db?: number;
    tls?: boolean;
}) => string;
export interface Connection {
    readonly send: (command: string, args?: readonly Arg[]) => Effect.Effect<Reply, CommandError>;
    readonly pipeline: (commands: ReadonlyArray<readonly [string, ...Arg[]]>) => Effect.Effect<readonly Reply[], CommandError>;
}
/**
 * Open an authenticated Redis session. Closes when the ambient Scope
 * is released. Concurrent `send`/`pipeline` calls on one connection
 * are serialized so replies stay ordered.
 */
export declare const connect: (url: string) => Effect.Effect<Connection, CommandError, Scope.Scope>;
/**
 * Send one Redis command over RESP and close the connection.
 */
export declare const run: (url: string, command: string, args?: readonly Arg[]) => Effect.Effect<Reply, CommandError>;
/**
 * Pipeline several commands on one connection, then close it.
 */
export declare const pipeline: (url: string, commands: ReadonlyArray<readonly [string, ...Arg[]]>) => Effect.Effect<readonly Reply[], CommandError>;
export declare const command: (url: Effect.Effect<string, UrlMissing, RuntimeContext>, name: string, args?: readonly Arg[]) => Effect.Effect<Reply, CommandError | UrlMissing, RuntimeContext>;
export declare const commandPipeline: (url: Effect.Effect<string, UrlMissing, RuntimeContext>, commands: ReadonlyArray<readonly [string, ...Arg[]]>) => Effect.Effect<readonly Reply[], CommandError | UrlMissing, RuntimeContext>;
//# sourceMappingURL=Protocol.d.ts.map