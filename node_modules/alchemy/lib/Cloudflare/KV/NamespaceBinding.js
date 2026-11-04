import * as Effect from "effect/Effect";
import { Worker, WorkerEnvironment } from "../Workers/Worker.js";
import { NamespaceError } from "./NamespaceTypes.js";
/**
 * Shared scaffolding for the Worker-binding implementations of the KV
 * services.
 *
 * Resolves the {@link WorkerEnvironment} and host {@link Worker}, registers
 * the `kv_namespace` binding at deploy time, then delegates to `makeClient`
 * with the shared {@link makeKVNamespaceHelpers} to build the
 * read/write/read-write client.
 */
export const makeKVNamespaceBinding = (options) => Effect.gen(function* () {
    const env = yield* WorkerEnvironment;
    const host = yield* Worker;
    return Effect.fn(function* (namespace) {
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            yield* host.bind `${namespace}`({
                bindings: [
                    {
                        type: "kv_namespace",
                        name: namespace.LogicalId,
                        namespaceId: namespace.namespaceId,
                    },
                ],
            });
        }
        return options.makeClient(makeKVNamespaceHelpers(env, namespace));
    });
});
/** Primitives shared by the read and write halves of the binding client. */
export const makeKVNamespaceHelpers = (env, namespace) => {
    const raw = Effect.sync(
    // Lazy — the WorkerEnvironment binding is not populated until runtime.
    () => env[namespace.LogicalId]);
    const tryPromise = (fn) => Effect.tryPromise({
        try: fn,
        catch: (error) => new NamespaceError({
            message: error?.message ?? "Unknown error",
            cause: error,
        }),
    });
    const use = (fn) => raw.pipe(Effect.flatMap((raw) => tryPromise(() => fn(raw))));
    return { raw, use, tryPromise };
};
//# sourceMappingURL=NamespaceBinding.js.map