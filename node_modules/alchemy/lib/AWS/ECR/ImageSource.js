import * as ecr from "@distilled.cloud/aws/ecr";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as Schedule from "effect/Schedule";
import { AlchemyContext } from "../../AlchemyContext.js";
import * as Bundle from "../../Bundle/Bundle.js";
import { findCwdForBundle, getStableContextDir, resolveMainPath, } from "../../Bundle/TempRoot.js";
import { hashDirectory } from "../../Command/Memo.js";
import { Docker } from "../../Docker/Docker.js";
import { isInlineDockerfile, } from "../../Docker/Dockerfile.js";
import { sha256Object } from "../../Util/sha256.js";
import { buildAndPushEcrImage, getEcrRegistryCredentials } from "./Image.js";
/**
 * Which image source a props bag declares. `main` always wins (the other
 * fields then describe its ENVIRONMENT); without `main`, `image` is the
 * mirrored-verbatim source and any `context`/`dockerfile` (path or inline)
 * is an external docker build.
 */
export const imageSourceKind = (source) => source.main !== undefined
    ? "main"
    : source.image !== undefined
        ? "image"
        : source.context !== undefined || source.dockerfile !== undefined
            ? "context"
            : undefined;
/**
 * Validate environment-source exclusivity. Dies (plan-time defect) on
 * `image`+`dockerfile`, `image`+`context`, or inline-`dockerfile`+`context`.
 */
export const validateImageSource = (id, source) => {
    if (source.image !== undefined && source.dockerfile !== undefined) {
        return Effect.die(new Error(`'${id}': 'image' and 'dockerfile' are both set — declare exactly one environment source (an 'image' ref, or a Dockerfile)`));
    }
    if (source.image !== undefined && source.context !== undefined) {
        return Effect.die(new Error(`'${id}': 'image' and 'context' are both set — declare exactly one environment source`));
    }
    if (source.dockerfile !== undefined &&
        isInlineDockerfile(source.dockerfile) &&
        source.context !== undefined) {
        return Effect.die(new Error(`'${id}': inline 'dockerfile' content builds with no context — use a path dockerfile with 'context', or drop 'context'`));
    }
    return Effect.void;
};
/**
 * The generated entry for `AWS.ECS.Task` / `AWS.ECS.Service` containers: a
 * shim importing only `alchemy/Runtime/Bootstrap/Ecs` (resolvable from any
 * consumer — `alchemy` is its direct dependency) plus the user's `main`.
 * Everything the runtime needs lives in that real module, so the virtual
 * entry never imports alchemy's own dependencies (`@distilled.cloud/*`,
 * `@effect/platform-bun`), which an isolated install cannot resolve from
 * the consumer's project.
 */
export const makeBunBootstrap = (handler) => (importPath) => `
import { bootstrap } from "alchemy/Runtime/Bootstrap/Ecs";
import { ${handler} as entrypoint } from ${JSON.stringify(importPath)};

await bootstrap(entrypoint);
`;
/**
 * Resolve the Dockerfile path for a `context` source: always relative to the
 * cwd (absolute paths pass through), defaulting to `${context}/Dockerfile`.
 */
const resolveContextPaths = Effect.fn(function* (source) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const context = path.resolve(source.context ?? ".");
    const dockerfile = source.dockerfile
        ? path.resolve(source.dockerfile)
        : path.join(context, "Dockerfile");
    if (!(yield* fs.exists(context))) {
        return yield* Effect.die(new Error(`Docker build context does not exist: ${context}`));
    }
    if (!(yield* fs.exists(dockerfile))) {
        return yield* Effect.die(new Error(`Dockerfile does not exist: ${dockerfile}`));
    }
    return { context, dockerfile };
});
/**
 * Content hash for the sources whose identity is computable WITHOUT running
 * a bundler:
 *
 * - `context` — hash of the build-context directory + Dockerfile content +
 *   platform.
 * - `image` — hash of the image reference + platform (re-mirror only when
 *   the ref changes).
 * - `main` — `undefined`: the hash comes from the bundle output, so it is
 *   only known inside `resolve`.
 *
 * Providers use this in `diff` to surface content drift (files changed under
 * an unchanged `context` path) as an update.
 */
export const computeStaticSourceHash = Effect.fn(function* (source, platform) {
    const kind = imageSourceKind(source);
    if (kind === "image") {
        return (yield* sha256Object({
            image: source.image,
            platform: platform ?? "linux/amd64",
        })).slice(0, 16);
    }
    if (kind === "context") {
        if (source.dockerfile !== undefined &&
            isInlineDockerfile(source.dockerfile)) {
            // Inline content builds with no context; an unresolved (Output)
            // content can't be hashed at plan time — defer to reconcile.
            if (typeof source.dockerfile.content !== "string")
                return undefined;
            return (yield* sha256Object({
                dockerfile: source.dockerfile.content,
                platform: platform ?? "linux/amd64",
            })).slice(0, 16);
        }
        const fs = yield* FileSystem.FileSystem;
        const { context, dockerfile } = yield* resolveContextPaths({
            context: source.context,
            dockerfile: source.dockerfile,
        });
        const contextHash = yield* hashDirectory({ cwd: context });
        const dockerfileContent = yield* fs.readFileString(dockerfile);
        return (yield* sha256Object({
            contextHash,
            dockerfile: dockerfileContent,
            platform: platform ?? "linux/amd64",
        })).slice(0, 16);
    }
    return undefined;
});
/**
 * Init-time constructor for the image-source resolver. Resolves the services
 * that are only available at provider-layer construction (Docker, the
 * `.alchemy` directory, the rolldown virtual-entry plugin) and returns
 * `resolve`, the per-reconcile entrypoint.
 */
export const makeImageSource = Effect.gen(function* () {
    const docker = yield* Docker;
    const { dotAlchemy } = yield* AlchemyContext;
    const virtualEntryPlugin = yield* Bundle.virtualEntryPlugin;
    /**
     * The exact rolldown input/output options `bundleProgram` hands to
     * `Bundle.build` — shared with {@link watchMain} so a dev watcher's
     * `Bundle.watch` observes the identical module graph.
     */
    const mainBundleOptions = (source, entry, cwd, plugins) => ({
        inputOptions: {
            ...source.build?.input,
            input: entry,
            cwd,
            platform: "node",
            // The container runs on `bun`; keep `bun`/`bun:*` external (the
            // runtime provides them) and resolve the `bun` export condition
            // so `@effect/platform-bun` picks its Bun implementations.
            external: [
                "bun",
                "bun:*",
                ...(source.build?.input?.external ?? []),
            ],
            resolve: {
                conditionNames: [...Bundle.BUN_CONDITION_NAMES],
                ...source.build?.input?.resolve,
            },
            plugins: [source.build?.input?.plugins, plugins],
        },
        outputOptions: {
            ...source.build?.output,
            format: "esm",
            sourcemap: source.build?.output?.sourcemap ?? false,
            minify: source.build?.output?.minify ?? false,
            entryFileNames: "index.mjs",
        },
    });
    /** Bundle the Effect program behind a `main` source. */
    const bundleProgram = Effect.fn(function* (options) {
        const { source } = options;
        const realMain = yield* resolveMainPath(source.main);
        const cwd = yield* findCwdForBundle(realMain);
        const buildBundle = Effect.fn(function* (entry, plugins) {
            const opts = mainBundleOptions(source, entry, cwd, plugins);
            return yield* Bundle.build(opts.inputOptions, opts.outputOptions, source.build);
        });
        const bundleOutput = options.isExternal
            ? yield* buildBundle(realMain)
            : yield* buildBundle(realMain, virtualEntryPlugin(options.bootstrap));
        // Return every emitted file (entry + shared chunks). Dynamic imports in
        // the Bun HTTP server / AWS SDK split into chunks; dropping any of them
        // crashes the container with `Cannot find module './chunk-XXX.js'`.
        const files = bundleOutput.files.map((file) => ({
            path: file.path,
            content: typeof file.content === "string"
                ? new TextEncoder().encode(file.content)
                : file.content,
        }));
        return { files, hash: bundleOutput.hash };
    });
    /**
     * Bundle a `main` source and compute its content-addressed code hash.
     *
     * The hash covers the FULL image identity: the bundle output (which
     * includes the generated bootstrap entry, so bootstrap-template changes
     * invalidate it), the generated Dockerfile, and the target platform.
     * `resolve` and `hash` share this so the plan-time diff hash and the
     * pushed image tag always agree.
     */
    const computeMainCodeHash = Effect.fn(function* (options) {
        const bundled = yield* bundleProgram({
            source: options.source,
            isExternal: options.isExternal,
            bootstrap: options.bootstrap,
        });
        // A path-`dockerfile` environment is built as a separate local stage in
        // `resolve`; hash its identity (context files + Dockerfile content)
        // explicitly since the generated Dockerfile only references the local
        // env tag. Inline environments flow through the generated Dockerfile
        // text itself; `image` environments through its FROM line.
        const df = options.source.dockerfile;
        const isPathEnv = df !== undefined && !isInlineDockerfile(df);
        let envIdentity = {};
        if (isPathEnv) {
            const fs = yield* FileSystem.FileSystem;
            const { context, dockerfile } = yield* resolveContextPaths({
                context: options.source.context,
                dockerfile: df,
            });
            envIdentity = {
                envContextHash: yield* hashDirectory({ cwd: context }),
                envDockerfile: yield* fs.readFileString(dockerfile),
            };
        }
        const dockerfile = generateDockerfile(options.source, options.port, isPathEnv ? "<env>" : undefined);
        const codeHash = (yield* sha256Object({
            bundleHash: bundled.hash,
            dockerfile,
            platform: options.platform,
            ...envIdentity,
        })).slice(0, 16);
        return { bundled, dockerfile, codeHash };
    });
    /**
     * Generated Dockerfile for a bundled `main` program. The environment
     * preamble is, in order of precedence: `envFrom` (a locally-built
     * environment tag from a path-`dockerfile` two-stage build), inline
     * `dockerfile` content (already resolved), the `image` ref, or the
     * default bun base (`oven/bun` is Docker-Hub only — there is no
     * `docker/library/bun` and no `public.ecr.aws/oven/bun`).
     */
    const generateDockerfile = (source, port, envFrom) => {
        const preamble = envFrom !== undefined
            ? `FROM ${envFrom}`
            : source.dockerfile !== undefined &&
                isInlineDockerfile(source.dockerfile)
                ? String(source.dockerfile.content).trimEnd()
                : `FROM ${source.image ?? "oven/bun:1"}`;
        const lines = [
            preamble,
            `WORKDIR /app`,
            `COPY index.mjs /app/index.mjs`,
            // Copy any additional rolldown chunks (`chunk-XXX.js`,
            // `BunServices-YYY.js`, …). Non-trivial bundles always emit at
            // least one; minimal bundles emit none and the COPY no-ops.
            `COPY *.js /app/`,
        ];
        if (port !== undefined) {
            lines.push(`ENV PORT=${String(port)}`, `EXPOSE ${String(port)}`);
        }
        lines.push(`ENTRYPOINT ["bun", "/app/index.mjs"]`);
        return `${lines.join("\n")}\n`;
    };
    /**
     * Ensure the target ECR repository exists. Idempotent: tolerates
     * `RepositoryAlreadyExistsException` as a race / re-run and re-describes.
     */
    const ensureRepository = Effect.fn(function* (options) {
        const created = yield* ecr
            .createRepository({
            repositoryName: options.repositoryName,
            imageTagMutability: "MUTABLE",
            imageScanningConfiguration: {
                scanOnPush: true,
            },
            tags: Object.entries(options.tags ?? {}).map(([Key, Value]) => ({
                Key,
                Value,
            })),
        })
            .pipe(Effect.catchTag("RepositoryAlreadyExistsException", () => Effect.gen(function* () {
            const existing = yield* ecr.describeRepositories({
                repositoryNames: [options.repositoryName],
            });
            return {
                repository: existing.repositories?.[0],
            };
        })));
        const repository = created.repository;
        if (!repository?.repositoryUri) {
            return yield* Effect.die(new Error(`Failed to resolve ECR repository '${options.repositoryName}'`));
        }
        return repository.repositoryUri;
    });
    /** Observe a pushed tag in ECR. Missing repository or tag → undefined. */
    const describeImage = Effect.fn(function* (repositoryName, imageTag) {
        const described = yield* ecr
            .describeImages({
            repositoryName,
            imageIds: [{ imageTag }],
        })
            .pipe(Effect.catchTag(["ImageNotFoundException", "RepositoryNotFoundException"], () => Effect.succeed(undefined)));
        return described?.imageDetails?.[0];
    });
    /**
     * Resolve the image for a props bag: ensure the repository, compute the
     * content-addressed tag, then build/mirror + push only when that exact
     * tag is not already in ECR (crash-safe convergence).
     */
    const resolve = Effect.fn(function* (options) {
        const { id, source, repositoryName, session } = options;
        const platform = options.platform ?? "linux/amd64";
        const kind = imageSourceKind(source);
        if (kind === undefined) {
            return yield* Effect.die(new Error(`'${id}' must declare exactly one image source: 'main' (bundled Effect program), 'context' (Dockerfile build), or 'image' (registry reference)`));
        }
        yield* validateImageSource(id, source);
        const repositoryUri = options.repositoryUri ??
            (yield* ensureRepository({ repositoryName, tags: options.tags }));
        if (kind === "main") {
            // Bundle → hash → (skip if pushed) → materialize generated Dockerfile
            // → build + push.
            const df = source.dockerfile;
            if (df !== undefined &&
                isInlineDockerfile(df) &&
                typeof df.content !== "string") {
                return yield* Effect.die(new Error(`'${id}': inline dockerfile content did not resolve to a string — Outputs in Dockerfile.inline must be resolvable at deploy time`));
            }
            yield* session.note(`Bundling ${id} program...`);
            const { bundled, dockerfile, codeHash } = yield* computeMainCodeHash({
                source: source,
                isExternal: options.isExternal,
                bootstrap: options.bootstrap,
                port: options.port,
                platform,
            });
            const imageUri = `${repositoryUri}:${codeHash}`;
            if (yield* describeImage(repositoryName, codeHash)) {
                return { imageUri, repositoryName, repositoryUri, codeHash };
            }
            // A path-`dockerfile` environment builds first as a local stage in the
            // USER's context (so its COPYs resolve), then the generated Dockerfile
            // FROMs the local tag and layers the bundle on top.
            let envFrom;
            if (df !== undefined && !isInlineDockerfile(df)) {
                const env = yield* resolveContextPaths({
                    context: source.context,
                    dockerfile: df,
                });
                envFrom = `alchemy-env-${id.toLowerCase()}:${codeHash}`;
                yield* session.note(`Building environment image for ${id}...`);
                yield* docker.image.build({
                    context: env.context,
                    file: env.dockerfile,
                    tag: envFrom,
                    platform,
                });
            }
            const finalDockerfile = envFrom === undefined
                ? dockerfile
                : generateDockerfile(source, options.port, envFrom);
            const realMain = yield* resolveMainPath(source.main);
            const contextDir = yield* getStableContextDir(realMain, dotAlchemy, `${id}-image`);
            yield* docker.materialize({
                context: contextDir,
                dockerfile: finalDockerfile,
                // Entry chunk becomes `index.mjs`; all other chunks keep their
                // emitted `*.js` names so the entry's relative imports resolve.
                files: bundled.files.map((file, index) => ({
                    path: index === 0 ? "index.mjs" : file.path,
                    content: file.content,
                })),
            });
            yield* session.note(`Building container image ${imageUri}...`);
            yield* buildAndPushEcrImage(docker, {
                imageUri,
                context: contextDir,
                platform,
            });
            yield* session.note(`Pushed ${imageUri}`);
            return { imageUri, repositoryName, repositoryUri, codeHash };
        }
        if (kind === "image") {
            // Mirror: pull → tag → push. Content-addressed on the image ref, so
            // an already-mirrored ref is a no-op.
            const ref = source.image;
            const codeHash = (yield* computeStaticSourceHash(source, platform));
            const imageUri = `${repositoryUri}:${codeHash}`;
            if (yield* describeImage(repositoryName, codeHash)) {
                return { imageUri, repositoryName, repositoryUri, codeHash };
            }
            yield* session.note(`Pulling container image ${ref}...`);
            // A registry pull can wedge indefinitely under Docker Hub throttling /
            // credential-helper contention — bound it so a stuck pull fails the
            // deploy loudly instead of hanging the plan.
            yield* docker.image.pull(ref, platform).pipe(Effect.timeout("4 minutes"));
            yield* docker.image.tag(ref, imageUri);
            yield* session.note(`Pushing mirrored image ${imageUri}...`);
            const credentials = yield* getEcrRegistryCredentials;
            // Pin the platform on push: with the containerd image store a bare
            // push of a multi-arch tag sends every locally-present variant — a
            // stale other-arch variant in the local cache would reach ECR and the
            // task would crash with `exec format error`.
            yield* docker.image.push(imageUri, credentials, platform).pipe(Effect.retry({
                while: () => true,
                schedule: Schedule.exponential("2 seconds"),
                times: 3,
            }));
            yield* session.note(`Pushed ${imageUri}`);
            return { imageUri, repositoryName, repositoryUri, codeHash };
        }
        // kind === "context": docker build the user's Dockerfile — from a path
        // (in their context) or from inline content (empty stable context).
        const externalDf = source.dockerfile;
        if (externalDf !== undefined && isInlineDockerfile(externalDf)) {
            if (typeof externalDf.content !== "string") {
                return yield* Effect.die(new Error(`'${id}': inline dockerfile content did not resolve to a string — Outputs in Dockerfile.inline must be resolvable at deploy time`));
            }
            const codeHash = (yield* computeStaticSourceHash(source, platform));
            const imageUri = `${repositoryUri}:${codeHash}`;
            if (yield* describeImage(repositoryName, codeHash)) {
                return { imageUri, repositoryName, repositoryUri, codeHash };
            }
            const contextDir = yield* getStableContextDir(dotAlchemy, dotAlchemy, `${id}-image`);
            yield* docker.materialize({
                context: contextDir,
                dockerfile: externalDf.content,
                files: [],
            });
            yield* session.note(`Building container image ${imageUri}...`);
            yield* buildAndPushEcrImage(docker, {
                imageUri,
                context: contextDir,
                platform,
            });
            yield* session.note(`Pushed ${imageUri}`);
            return { imageUri, repositoryName, repositoryUri, codeHash };
        }
        const { context, dockerfile } = yield* resolveContextPaths({
            context: source.context,
            dockerfile: externalDf,
        });
        const codeHash = (yield* computeStaticSourceHash(source, platform));
        const imageUri = `${repositoryUri}:${codeHash}`;
        if (yield* describeImage(repositoryName, codeHash)) {
            return { imageUri, repositoryName, repositoryUri, codeHash };
        }
        yield* session.note(`Building container image ${imageUri}...`);
        yield* buildAndPushEcrImage(docker, {
            imageUri,
            context,
            dockerfile,
            platform,
        });
        yield* session.note(`Pushed ${imageUri}`);
        return { imageUri, repositoryName, repositoryUri, codeHash };
    });
    /**
     * Content hash for ANY source kind without building or pushing an image.
     *
     * For `main` sources this runs the bundler (bootstrap entry included) so
     * the hash reflects the exact image `resolve` would push — bootstrap
     * template changes and user-code edits both surface as drift. Providers
     * call this from `diff` and compare against `output.code.hash`; static
     * sources (`context` / `image`) delegate to
     * {@link computeStaticSourceHash}.
     */
    const hash = Effect.fn(function* (options) {
        const platform = options.platform ?? "linux/amd64";
        if (imageSourceKind(options.source) === "main") {
            // Unresolved inline environment content (an Output) can't be hashed
            // at plan time — return undefined so the diff defers to reconcile.
            const df = options.source.dockerfile;
            if (df !== undefined &&
                isInlineDockerfile(df) &&
                typeof df.content !== "string") {
                return undefined;
            }
            const { codeHash } = yield* computeMainCodeHash({
                source: options.source,
                isExternal: options.isExternal,
                bootstrap: options.bootstrap,
                port: options.port,
                platform,
            });
            return codeHash;
        }
        return yield* computeStaticSourceHash(options.source, platform);
    });
    /**
     * The rolldown watch plan for a `main` source — the exact input/output
     * options `resolve` bundles with, reusable verbatim with `Bundle.watch`
     * so a dev watcher observes the identical module graph and rebuild
     * triggers.
     */
    const watchMain = Effect.fn(function* (options) {
        const realMain = yield* resolveMainPath(options.source.main);
        const cwd = yield* findCwdForBundle(realMain);
        const opts = mainBundleOptions(options.source, realMain, cwd, options.isExternal ? undefined : virtualEntryPlugin(options.bootstrap));
        return { ...opts, extra: options.source.build };
    });
    return { resolve, hash, watchMain };
});
//# sourceMappingURL=ImageSource.js.map