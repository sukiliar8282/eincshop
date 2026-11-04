import * as Effect from "effect/Effect";
import { Stack } from "../../Stack.js";
import { Stage } from "../../Stage.js";
const NamespaceTypeId = "Cloudflare.Artifacts.Namespace";
/**
 * Cloudflare validation: 3–63 chars, lowercase alphanumeric and hyphens, must
 * start and end with a lowercase alphanumeric character.
 */
const ARTIFACTS_NAMESPACE_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$/;
export class InvalidNamespaceError extends Error {
    namespace;
    _tag = "InvalidNamespaceError";
    constructor(namespace) {
        super(`Invalid artifacts namespace name '${namespace}'. Must be 3-63 characters, start and end with a lowercase alphanumeric character, and contain only lowercase alphanumeric characters and hyphens.`);
        this.namespace = namespace;
    }
}
export const isNamespace = (value) => typeof value === "object" &&
    value !== null &&
    "kind" in value &&
    value.kind === NamespaceTypeId;
/**
 * A Cloudflare Artifacts namespace — the top-level container for Git-compatible
 * versioned repositories. See the
 * {@link https://blog.cloudflare.com/artifacts-git-for-agents-beta/ | Artifacts launch post}
 * and {@link https://developers.cloudflare.com/artifacts/concepts/namespaces/ | Namespaces docs}.
 *
 * Namespaces on Cloudflare are **implicit**: there is no `POST /namespaces`
 * endpoint. The namespace is conjured the first time a repo is created against
 * it (either via the REST API or the Worker binding). Because of that, the
 * Alchemy "resource" is a thin binding marker — there is nothing to provision
 * at deploy time. Repos themselves are typically created at runtime through
 * the bound `Artifacts` API.
 *
 * Unlike the other Worker-only bindings, an Artifacts namespace does **not**
 * auto-bind when yielded — it always requires an explicit access level via
 * {@link ReadNamespace} / {@link WriteNamespace} / {@link ReadWriteNamespace}.
 *
 * ### Declaring a Namespace
 * **Example:** Default namespace (a unique physical name is generated)
 * ```typescript
 * const Repos = Cloudflare.Artifacts.Namespace("Repos");
 * ```
 *
 * **Example:** Override the namespace name (must be lowercase, 3–63 chars)
 * ```typescript
 * const Repos = Cloudflare.Artifacts.Namespace("Repos", { namespace: "starter-repos" });
 * ```
 *
 * ### Binding to a Worker
 * **Example:** Wiring it into a Worker
 * ```typescript
 * export const Worker = Cloudflare.Worker("Worker", {
 *   main: "./src/worker.ts",
 *   bindings: { Repos },
 * });
 *
 * export type WorkerEnv = Cloudflare.InferEnv<typeof Worker>;
 * //   { Repos: Artifacts }
 * ```
 *
 * **Example:** Async-style worker
 * ```typescript
 * export default {
 *   async fetch(request: Request, env: WorkerEnv) {
 *     const repo = await env.Repos.create("starter-repo");
 *     return Response.json({ remote: repo.remote, token: repo.token });
 *   },
 * };
 * ```
 *
 * **Example:** Effect-style worker (explicit access level)
 * ```typescript
 * const artifacts = yield* Cloudflare.Artifacts.ReadWriteNamespace(Repos);
 * const repo = yield* artifacts.create("starter-repo", {
 *   setDefaultBranch: "main",
 * });
 * ```
 *
 * @binding
 * @product Artifacts
 * @category Developer Platform
 */
export const Namespace = Effect.fn(function* (name, props) {
    const namespace = props?.namespace
        ? props.namespace
        : name.toLocaleLowerCase();
    if (!ARTIFACTS_NAMESPACE_REGEX.test(namespace)) {
        return yield* Effect.die(new InvalidNamespaceError(namespace));
    }
    return {
        kind: NamespaceTypeId,
        name,
        namespace,
    };
});
//# sourceMappingURL=Namespace.js.map