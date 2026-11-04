import * as Effect from "effect/Effect";
import { AlchemyContext } from "../AlchemyContext.js";
import * as Bundle from "../Bundle/Bundle.js";
import { findCwdForBundle, getStableContextDir, resolveMainPath, } from "../Bundle/TempRoot.js";
import { sha256Object } from "../Util/sha256.js";
import { Docker } from "./Docker.js";
/**
 * The generated entry for `Docker.Service` containers: a shim importing only
 * `alchemy/Runtime/Bootstrap/Docker` plus the user's `main` — see that
 * module for why the entry never imports alchemy's own dependencies.
 */
export const makeServiceBunBootstrap = (handler) => (importPath) => `
import { bootstrap } from "alchemy/Runtime/Bootstrap/Docker";
import { ${handler} as entrypoint } from ${JSON.stringify(importPath)};

await bootstrap(entrypoint);
`;
/**
 * Init-time constructor for the service-image resolver. Resolves the services
 * that are only available at provider-layer construction (Docker, the
 * `.alchemy` directory, the rolldown virtual-entry plugin) and returns
 * `resolve` (build the image if its content hash isn't present in the target
 * engine) and `hash` (content hash only, for `diff`).
 */
export const makeServiceImage = Effect.gen(function* () {
    const docker = yield* Docker;
    const { dotAlchemy } = yield* AlchemyContext;
    const virtualEntryPlugin = yield* Bundle.virtualEntryPlugin;
    /** Bundle the Effect program behind a `main` source. */
    const bundleProgram = Effect.fn(function* (options) {
        const { source } = options;
        const realMain = yield* resolveMainPath(source.main);
        const cwd = yield* findCwdForBundle(realMain);
        const bootstrap = makeServiceBunBootstrap(source.handler ?? "default");
        const buildBundle = Effect.fn(function* (entry, plugins) {
            return yield* Bundle.build({
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
            }, {
                ...source.build?.output,
                format: "esm",
                sourcemap: source.build?.output?.sourcemap ?? false,
                minify: source.build?.output?.minify ?? false,
                entryFileNames: "index.mjs",
            }, source.build);
        });
        const bundleOutput = options.isExternal
            ? yield* buildBundle(realMain)
            : yield* buildBundle(realMain, virtualEntryPlugin(bootstrap));
        // Return every emitted file (entry + shared chunks). Dynamic imports in
        // the Bun HTTP server split into chunks; dropping any of them crashes the
        // container with `Cannot find module './chunk-XXX.js'`.
        const files = bundleOutput.files.map((file) => ({
            path: file.path,
            content: typeof file.content === "string"
                ? new TextEncoder().encode(file.content)
                : file.content,
        }));
        return { files, hash: bundleOutput.hash };
    });
    /**
     * Generated Dockerfile for a bundled `main` program. The environment
     * preamble is the `image` ref or the default bun base (`oven/bun` is
     * Docker-Hub only).
     */
    const generateDockerfile = (source) => {
        const lines = [
            `FROM ${source.image ?? "oven/bun:1"}`,
            `WORKDIR /app`,
            `COPY index.mjs /app/index.mjs`,
            // Copy any additional rolldown chunks (`chunk-XXX.js`, …). Non-trivial
            // bundles always emit at least one; minimal bundles emit none and the
            // COPY no-ops.
            `COPY *.js /app/`,
        ];
        if (source.port !== undefined) {
            lines.push(`ENV PORT=${String(source.port)}`, `EXPOSE ${String(source.port)}`);
        }
        lines.push(`ENTRYPOINT ["bun", "/app/index.mjs"]`);
        return `${lines.join("\n")}\n`;
    };
    /**
     * Bundle a `main` source and compute its content-addressed code hash. The
     * hash covers the full image identity — the bundle output (bootstrap entry
     * included, so bootstrap-template changes invalidate it) and the generated
     * Dockerfile — so `diff` and `resolve` always agree.
     */
    const computeCodeHash = Effect.fn(function* (options) {
        const bundled = yield* bundleProgram(options);
        const dockerfile = generateDockerfile(options.source);
        const codeHash = (yield* sha256Object({
            bundleHash: bundled.hash,
            dockerfile,
        })).slice(0, 16);
        return { bundled, dockerfile, codeHash };
    });
    /** Observe a locally-present tag in the target engine. Missing → undefined. */
    const imageExists = (imageRef, context) => docker.image.inspect(imageRef, context).pipe(Effect.map(() => true), Effect.catchReason("PlatformError", "NotFound", () => Effect.succeed(false)));
    /**
     * Resolve the image for a bundled service: compute the content-addressed
     * tag, then build only when that exact tag is not already present in the
     * target Docker context (crash-safe convergence).
     */
    const resolve = Effect.fn(function* (options) {
        const { id, source, session } = options;
        yield* session.note(`Bundling ${id} program...`);
        const { bundled, dockerfile, codeHash } = yield* computeCodeHash({
            source,
            isExternal: options.isExternal,
        });
        const imageRef = `${options.name}:${codeHash}`;
        if (yield* imageExists(imageRef, options.context)) {
            return { imageRef, codeHash };
        }
        const realMain = yield* resolveMainPath(source.main);
        const contextDir = yield* getStableContextDir(realMain, dotAlchemy, `${id}-image`);
        yield* docker.materialize({
            context: contextDir,
            dockerfile,
            // Entry chunk becomes `index.mjs`; all other chunks keep their emitted
            // `*.js` names so the entry's relative imports resolve.
            files: bundled.files.map((file, index) => ({
                path: index === 0 ? "index.mjs" : file.path,
                content: file.content,
            })),
        });
        yield* session.note(`Building container image ${imageRef}...`);
        yield* docker.image.build({
            context: contextDir,
            tag: imageRef,
            engineContext: options.context,
        });
        yield* session.note(`Built ${imageRef}`);
        return { imageRef, codeHash };
    });
    /**
     * Content hash without building the image. Runs the bundler (bootstrap
     * entry included) so the hash reflects the exact image `resolve` would
     * build — bootstrap-template changes and user-code edits both surface as
     * drift. The provider calls this from `diff` and compares against
     * `output.code.hash`.
     */
    const hash = Effect.fn(function* (options) {
        const { codeHash } = yield* computeCodeHash(options);
        return codeHash;
    });
    return { resolve, hash };
});
//# sourceMappingURL=ServiceImage.js.map