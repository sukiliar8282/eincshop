import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import * as Scope from "effect/Scope";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpServer from "effect/unstable/http/HttpServer";
import * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner";
import { type RpcServerEnvironment } from "./RpcServerEnvironment.ts";
declare const RpcSpawner_base: Context.ServiceClass<RpcSpawner, "alchemy/Local/RpcSpawner", {
    readonly url: string;
}>;
export declare class RpcSpawner extends RpcSpawner_base {
}
/**
 * The spawner forks one child per distinct `serverEntryUrl`. Stack-specific
 * context (stack name/stage, AlchemyContext) is NOT part of the spawn key —
 * it travels per RPC session (see `SESSION_ENV_PARAM`), so many stacks
 * (e.g. every test file in a run) share a single sidecar process.
 */
export declare const RpcSpawnPayload: Schema.Struct<{
    readonly serverEntryUrl: Schema.String;
}>;
export type RpcSpawnPayload = typeof RpcSpawnPayload.Type;
/**
 * One line of sidecar child output, tagged with the channel it arrived on.
 * Streamed as NDJSON over the spawner's {@link LOGS_PATH} endpoint.
 */
export interface SidecarLogLine {
    readonly channel: "stdout" | "stderr";
    readonly line: string;
}
export declare const HeartbeatFrame: Schema.Struct<{
    readonly channel: Schema.Literal<"heartbeat">;
}>;
export type HeartbeatFrame = typeof HeartbeatFrame.Type;
/**
 * Path on the spawner's HTTP server that streams sidecar output as NDJSON
 * ({@link SidecarLogLine} per line). Consumed by {@link forwardSidecarLogs}
 * from the exec child, which owns the terminal renderer.
 */
export declare const LOGS_PATH = "/logs";
export declare const make: (args_0: Pick<RpcServerEnvironment, "envFile" | "profile">) => Effect.Effect<{
    readonly url: string;
}, never, ChildProcessSpawner.ChildProcessSpawner | HttpServer.HttpServer | Scope.Scope>;
export declare const layerServer: (environment: Pick<RpcServerEnvironment, "profile" | "envFile">) => Layer.Layer<RpcSpawner, import("effect/unstable/http/HttpServerError").ServeError, ChildProcessSpawner.ChildProcessSpawner>;
export declare const parseSidecarLogLine: (raw: string) => SidecarLogLine | undefined;
/**
 * Pull sidecar output from the spawner (the outer `alchemy dev` process)
 * into THIS process's Console. The exec child owns the terminal renderer —
 * Sigil patches its `console`, so lines printed here are inserted cleanly
 * above the repainting progress region instead of racing it on the shared
 * tty. Forks in the ambient scope and never fails: when no spawner is
 * configured (`ALCHEMY_RPC_SPAWNER_URL` absent — plain deploy/destroy) it is
 * a no-op, and if the connection drops the spawner's own fallback printing
 * takes over.
 */
export declare const forwardSidecarLogs: (
/** Mirrors every forwarded line (e.g. into a dev log file). */
tee?: (line: SidecarLogLine) => void) => Effect.Effect<void, never, HttpClient.HttpClient | Scope.Scope>;
export {};
//# sourceMappingURL=RpcSpawner.d.ts.map