import type * as runtime from "@cloudflare/workers-types";
import * as Effect from "effect/Effect";
import { Worker, WorkerEnvironment } from "../Workers/Worker.ts";
import type { Namespace } from "./Namespace.ts";
import { NamespaceError } from "./NamespaceTypes.ts";
/**
 * Shared scaffolding for the Worker-binding implementations of the KV
 * services.
 *
 * Resolves the {@link WorkerEnvironment} and host {@link Worker}, registers
 * the `kv_namespace` binding at deploy time, then delegates to `makeClient`
 * with the shared {@link makeKVNamespaceHelpers} to build the
 * read/write/read-write client.
 */
export declare const makeKVNamespaceBinding: <Client>(options: {
    makeClient: (helpers: ReturnType<typeof makeKVNamespaceHelpers>) => Client;
}) => Effect.Effect<(namespace: Namespace) => Effect.Effect<Client, never, never>, never, WorkerEnvironment | Worker<any>>;
/** Primitives shared by the read and write halves of the binding client. */
export declare const makeKVNamespaceHelpers: (env: Record<string, any>, namespace: Namespace) => {
    raw: Effect.Effect<runtime.KVNamespace<string>, never, never>;
    use: <T>(fn: (raw: runtime.KVNamespace<string>) => Promise<T>) => Effect.Effect<T, NamespaceError>;
    tryPromise: <T>(fn: () => Promise<T>) => Effect.Effect<T, NamespaceError>;
};
//# sourceMappingURL=NamespaceBinding.d.ts.map