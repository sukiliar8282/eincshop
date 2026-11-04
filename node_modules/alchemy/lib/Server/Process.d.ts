import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { FileSystem } from "effect/FileSystem";
import type { Path } from "effect/Path";
import type { Stdio } from "effect/Stdio";
import type { Terminal } from "effect/Terminal";
import type { ChildProcessSpawner } from "effect/unstable/process/ChildProcessSpawner";
import type { HttpEffect } from "../Http.ts";
import { type BaseRuntimeContext } from "../RuntimeContext.ts";
export type ProcessServices = ChildProcessSpawner | FileSystem | Path | Stdio | Terminal;
export interface ProcessContext extends BaseRuntimeContext {
    run: <Req = never, RunReq = never>(effect: Effect.Effect<void, never, RunReq>) => Effect.Effect<void, never, Req | RunReq>;
}
declare const ServerHost_base: Context.ServiceClass<ServerHost, "Alchemy::ServerHost", Pick<ProcessContext, "run">>;
/**
 * Long-running host loop registration (`run`). Provided by `Platform` when the
 * execution context implements {@link ProcessContext} (i.e. carries `run`).
 *
 * `Platform` wires this automatically for every host runtime context that
 * implements `run` (EC2 instances, ECS tasks, processes), so an inline program
 * can `yield* ServerHost` and call `host.run(...)` during plan/deploy without
 * the caller providing the layer itself.
 */
export declare class ServerHost extends ServerHost_base {
}
/**
 * Deploy-time / plan-time host context for platforms that bundle a long-lived
 * program. It collects background work registered via `run` and HTTP handlers
 * registered via `serve` into a single `exports.program` effect that the
 * generated container/instance entrypoint runs.
 */
export interface HostRuntimeContext extends ProcessContext {
    serve: <Req = never>(handler: HttpEffect<Req> | Effect.Effect<HttpEffect<Req>>, options?: {
        shape?: Record<string, unknown>;
    }) => Effect.Effect<void, never, Req>;
    exports: Effect.Effect<{
        readonly program: Effect.Effect<void, never, any>;
    }>;
}
/**
 * Build a {@link HostRuntimeContext} for a hosted platform of the given
 * resource `type`. Both `run` (background loops) and `serve` (HTTP handlers)
 * append to a single list of runners; `exports.program` runs them all
 * concurrently. This is the shared host context used by `AWS.EC2.Instance` and
 * `AWS.ECS.Task`.
 */
export declare const createHostRuntimeContext: (type: string) => (id: string) => HostRuntimeContext;
/**
 * Host runtime context for container platforms (`AWS.ECS.Task`,
 * `AWS.ECS.Service`, `Docker.Service`): extends the shared process host
 * context so an impl shape's `run` effect is registered as a one-shot runner
 * (the container exits when it completes) and the HTTP server only boots when
 * the impl actually declares a `fetch` handler.
 */
export declare const createContainerRuntimeContext: (type: string) => (id: string) => HostRuntimeContext;
export {};
//# sourceMappingURL=Process.d.ts.map