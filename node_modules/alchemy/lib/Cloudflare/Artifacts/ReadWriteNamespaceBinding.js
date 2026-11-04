import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Worker, WorkerEnvironment } from "../Workers/Worker.js";
import {} from "./Namespace.js";
import { ArtifactsError, ReadNamespace, ReadWriteNamespace, WriteNamespace, } from "./ReadWriteNamespace.js";
const tryPromise = (fn) => Effect.tryPromise({
    try: fn,
    catch: (error) => new ArtifactsError({
        message: error?.message ?? "Unknown error",
        cause: error,
    }),
});
const wrapRepo = (raw) => ({
    raw,
    createToken: (scope, ttl) => tryPromise(() => raw.createToken(scope, ttl)),
    listTokens: () => tryPromise(() => raw.listTokens()),
    revokeToken: (tokenOrId) => tryPromise(() => raw.revokeToken(tokenOrId)),
    fork: (name, opts) => tryPromise(() => raw.fork(name, opts)),
});
/**
 * Builds the full Artifacts client over the native worker binding. Each access
 * level (Read / Write / ReadWrite) returns this same object typed to its subset
 * — least-privilege by construction at the call site.
 */
const makeArtifactsClient = (env, namespace) => {
    const raw = Effect.sync(() => env[namespace.name]);
    const use = (fn) => raw.pipe(Effect.flatMap((raw) => tryPromise(() => fn(raw))));
    return {
        raw,
        create: (name, opts) => use((raw) => raw.create(name, opts)),
        get: (name) => use((raw) => raw.get(name)).pipe(Effect.flatMap((repo) => repo == null
            ? Effect.fail(new ArtifactsError({
                message: `Artifacts repo '${name}' not found`,
                cause: new Error("not_found"),
            }))
            : Effect.succeed(wrapRepo(repo)))),
        list: (opts) => use((raw) => raw.list(opts)),
        delete: (name) => use((raw) => raw.delete(name)),
        import: (opts) => use((raw) => raw.import(opts)),
    };
};
const makeBinding = (tag) => Layer.effect(tag, Effect.gen(function* () {
    const env = yield* WorkerEnvironment;
    const host = yield* Worker;
    return Effect.fn(function* (namespace) {
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            yield* host.bind(namespace.name, {
                bindings: [
                    {
                        type: "artifacts",
                        name: namespace.name,
                        namespace: namespace.namespace,
                    },
                ],
            });
        }
        return makeArtifactsClient(env, namespace);
    });
}));
/** Read-only Artifacts binding (`get`/`list`/`raw`). */
export const ReadNamespaceBinding = makeBinding(ReadNamespace);
/** Write Artifacts binding (`create`/`delete`/`import`). */
export const WriteNamespaceBinding = makeBinding(WriteNamespace);
/** Full read + write Artifacts binding. */
export const ReadWriteNamespaceBinding = makeBinding(ReadWriteNamespace);
//# sourceMappingURL=ReadWriteNamespaceBinding.js.map