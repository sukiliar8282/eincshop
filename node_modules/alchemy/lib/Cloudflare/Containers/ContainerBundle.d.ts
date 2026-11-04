import * as Effect from "effect/Effect";
import * as Path from "effect/Path";
import * as Redacted from "effect/Redacted";
import { AlchemyContext } from "../../AlchemyContext.ts";
import * as Bundle from "../../Bundle/Bundle.ts";
import { Docker } from "../../Docker/Docker.ts";
import { Stack } from "../../Stack.ts";
import type { AnyContainerApplicationProps } from "./ContainerApplication.ts";
/**
 * Fold the runtime-context `env` map (populated by `Binding.Service`s and
 * `Config` injection — see `ContainerPlatform.set`) into the application's
 * `environmentVariables`.
 *
 * Unlike Cloudflare Workers, container `secrets` are *references to the
 * account Secrets Store by name* — they cannot carry an inline value — so
 * runtime-bound values (e.g. a minted API token) must travel as plain
 * `environmentVariables`. The value is the JSON-encoded payload produced by
 * `ContainerPlatform.set` (a `{_tag:"Redacted",value}` marker for secrets,
 * a JSON string otherwise), which `ContainerPlatform.get` parses back into
 * the original `Redacted`/plain value at runtime.
 *
 * `precreate` receives the raw, unevaluated props (the engine only resolves
 * Output expressions for the real `reconcile`/create), so env values that
 * reference other resources are still unresolved `Output`s there — skip them.
 * They are applied when reconcile runs against the resolved props.
 *
 * When `accountId` is provided it is injected as `ALCHEMY_CLOUDFLARE_ACCOUNT_ID`
 * (mirroring the Worker runtime) so the container bootstrap can build
 * `CloudflareEnvironment` for HTTP capability bindings (R2/KV/Queue `*Http`).
 *
 * `bindings` carries the resource's binding contract — the `{ env }` a
 * `Binding.Service` attaches with ``host.bind`${resource}`({ env })`` when the
 * container is the host (`Prisma.Connect`, and any other capability whose
 * runtime config travels as environment variables). Bindings are resolved by
 * the engine before `reconcile`, so they land here already evaluated. They are
 * applied FIRST, at the lowest precedence: an explicitly declared `env` or
 * `environmentVariables` entry always wins over a capability-injected one.
 */
export declare const makeContainerEnv: (props: AnyContainerApplicationProps, accountId: string, bindings?: readonly {
    data?: {
        env?: Record<string, any>;
    } | undefined;
}[]) => Record<string, string | Redacted.Redacted<string>>;
/**
 * Derive the physical name for a container application. Shared between the
 * live and local providers so they agree on the deterministic name.
 */
export declare const createContainerApplicationName: (id: string, name: string | undefined) => Effect.Effect<string, never, import("../../InstanceId.ts").InstanceId | Stack | import("../../Stage.ts").Stage>;
/**
 * Validate the image-source composition on container props. Exactly one
 * environment/source may be declared:
 *
 * - `main` + optional `image` (environment base) OR inline `dockerfile`
 *   (environment preamble) — never both, and never a `context`.
 * - `image` alone — a pre-built remote image, exclusive with `dockerfile`
 *   and `context`.
 * - `dockerfile` (string path against `context`, or inline content with no
 *   `context`) — the user-Dockerfile build.
 *
 * Invalid combinations are programmer errors, surfaced as plan-time defects
 * (`Effect.die`) rather than typed errors.
 */
export declare const validateContainerImageProps: (props: Pick<AnyContainerApplicationProps, "main" | "image" | "dockerfile" | "context">) => Effect.Effect<void>;
/**
 * Resolve the environment preamble for a generated (Effect-native) container
 * Dockerfile from the props' `image` / inline `dockerfile` composition:
 *
 * - inline `dockerfile` content → used verbatim as the preamble (it carries
 *   its own `FROM` and any extra build steps),
 * - `image` → a synthesized `FROM <image>` line,
 * - neither → `undefined` (callers fall back to the runtime default base).
 */
export declare const containerEnvPreamble: (props: Pick<AnyContainerApplicationProps, "image" | "dockerfile">) => Effect.Effect<string | undefined>;
/**
 * Build the final Dockerfile used for a generated (Effect-native) container
 * image. Starts from the environment preamble (see
 * {@link containerEnvPreamble}) — or a runtime-appropriate default base —
 * then appends the statements that copy the bundled program and set the
 * entrypoint.
 */
export declare const buildFinalDockerfile: (envPreamble: string | undefined, runtime: "bun" | "node", external?: string[], autoInstallExternals?: boolean) => string;
/**
 * Materialize resolved inline `dockerfile` content into a stable,
 * deterministic build-context directory (containing only the Dockerfile) so
 * both the live provider and the local dev runtime can `docker build` it.
 * Shared by the live and local providers so they agree on the path.
 */
export declare const materializeInlineDockerfileContext: (id: string, content: string) => Effect.Effect<{
    context: string;
    dockerfile: string;
}, import("effect/PlatformError").PlatformError, AlchemyContext | Docker | import("effect/FileSystem").FileSystem | Path.Path | Stack | import("../../Stage.ts").Stage>;
/**
 * Bundle the container entrypoint program with rolldown. Returns every emitted
 * file (entry chunk plus shared chunks) so the full set can be materialized
 * into the Docker build context, along with a content hash of the bundle.
 *
 * Shared between the live provider (which builds + pushes a Cloudflare image)
 * and the local provider (which writes the context to disk for the runtime to
 * `docker build`).
 */
export declare const bundleContainerProgram: (args_0: {
    id: string;
    main: string;
    runtime: "bun" | "node";
    handler?: string | undefined;
    isExternal?: boolean;
    external?: string[];
    outdir?: string;
    build?: Bundle.BundleConfig;
}) => Effect.Effect<{
    files: {
        path: string;
        content: Uint8Array<ArrayBufferLike>;
    }[];
    hash: string;
}, Bundle.BundleError | import("effect/PlatformError").PlatformError, import("effect/FileSystem").FileSystem | Path.Path | Stack>;
/**
 * Bundle an Effect-native container `main` and materialize it (plus the
 * generated Dockerfile) into a stable Docker build context directory, then
 * return the paths + content hash of that context.
 *
 * This is the local-dev image shape (`ContainerImage.Build`) that
 * `@alchemy.run/cloudflare-runtime/core` consumes: it `docker build`s the
 * `dockerfile` against the `context` directory. Shared between the local
 * provider (which serves this context to the runtime as the `dev` image) and
 * the live provider (which persists the same deterministic context path as
 * `dev` so a subsequent `alchemy dev` run has an image to build even though the
 * live deploy pushed to Cloudflare's registry instead).
 *
 * The context directory is deterministic for a given resource id, so live and
 * local agree on the path. Callers that want to skip re-bundling on an
 * unchanged resource should wrap this in {@link Artifacts.cached}.
 */
export declare const prepareContainerBuildContext: (id: string, news: AnyContainerApplicationProps) => Effect.Effect<{
    context: string;
    dockerfile: string;
    hash: string;
}, Bundle.BundleError | import("effect/PlatformError").PlatformError, AlchemyContext | Docker | import("effect/FileSystem").FileSystem | Path.Path | Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ContainerBundle.d.ts.map