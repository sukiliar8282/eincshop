import { NODE_SERVE_ENTRY_FILE_NAME, relativeClientDirExpression, writeNodeServeEntry, } from "@alchemy.run/frontend-frameworks/core";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import { AlchemyContext } from "../../AlchemyContext.js";
import * as Command from "../../Command/index.js";
import * as Namespace from "../../Namespace.js";
import * as Output from "../../Output.js";
import { ProviderModePolicy } from "../../ProviderMode.js";
import { initialCwd } from "../../Util/Node.js";
import { Service } from "../Service.js";
import { bindWebsiteDomain, DEFAULT_WEBSITE_PORT, resolveWebsiteServer, unwrapEnv, websiteUrl, } from "./FrameworkSite.js";
/**
 * A Hetzner Service that serves static assets built by a shell command.
 *
 * `StaticSite` runs a build command (e.g. `npm run build`), packs the
 * output directory into the unit archive, and deploys a tiny static-file
 * server (`GET` assets, `/health`, optional SPA / 404-page). Use this
 * when your site has its own build step — Hugo, Zola, Eleventy, or any
 * custom pipeline.
 *
 * For Vite-based projects, prefer {@link Vite | Hetzner.Website.Vite}.
 *
 * `Dev` and `Build` carry constant logical ids, so they are namespaced
 * under `id`. The Service stays in the caller's namespace (same as
 * Cloudflare.Website.StaticSite).
 *
 *
 * ### Basic Usage
 * **Example:** Deploying a Hugo site
 * ```typescript
 * const site = yield* Hetzner.Website.StaticSite("Blog", {
 *   command: "hugo --minify",
 *   outdir: "public",
 * });
 * ```
 *
 * **Example:** SPA-style routing
 * ```typescript
 * const site = yield* Hetzner.Website.StaticSite("App", {
 *   command: "npm run build",
 *   outdir: "dist",
 *   spa: true,
 * });
 * ```
 *
 * ### Building from a Subdirectory
 * **Example:** Building a frontend in a monorepo
 * ```typescript
 * const site = yield* Hetzner.Website.StaticSite("Web", {
 *   cwd: "apps/web",
 *   command: "npm run build",
 *   outdir: "dist",
 * });
 * ```
 *
 * ### Local Development
 * **Example:** External Dev Server
 * ```typescript
 * const site = yield* Hetzner.Website.StaticSite("App", {
 *   command: "npm run build",
 *   outdir: "dist",
 *   dev: { command: "npm run dev" },
 * });
 * ```
 *
 * @resource
 * @product Website
 */
export const StaticSite = (id, props) => Effect.gen(function* () {
    const ctx = yield* AlchemyContext;
    const remoted = yield* ProviderModePolicy;
    const isLocal = ctx.dev && remoted !== true;
    const port = DEFAULT_WEBSITE_PORT;
    if (props.spa && props.errorPage) {
        return yield* Effect.die(`Cannot provide both "spa" and "errorPage". A SPA answers misses with the index page (200); "errorPage" answers them with a real 404.`);
    }
    if (props.domain !== undefined && props.zone === undefined) {
        return yield* Effect.die(`Hetzner.Website.StaticSite: "domain" requires "zone" (an existing Hetzner.Zone).`);
    }
    if (isLocal && props.dev) {
        const dev = yield* Command.Dev("Dev", {
            command: props.dev.command,
            cwd: props.dev.cwd ?? props.cwd,
            env: props.dev.env ?? props.env,
        }).pipe(Namespace.push(id));
        const url = Output.map((detected) => detected ?? props.dev?.url)(dev.url);
        return {
            url,
            server: undefined,
            service: undefined,
        };
    }
    const build = yield* Command.Build("Build", {
        command: props.command,
        cwd: props.cwd,
        memo: props.memo,
        outdir: props.outdir,
        env: props.env,
    }).pipe(Namespace.push(id));
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const cwd = path.resolve(initialCwd, props.cwd ?? ".");
    const outdir = path.resolve(cwd, props.outdir);
    const servePath = path.join(path.dirname(outdir), NODE_SERVE_ENTRY_FILE_NAME);
    yield* writeNodeServeEntry({
        output: {
            clientDirectory: outdir,
            serverModules: [],
            externalWorkspaces: new Set(),
        },
        servePath,
        serveModuleName: NODE_SERVE_ENTRY_FILE_NAME,
        clientDirExpression: relativeClientDirExpression(servePath, outdir),
        notFoundHandling: props.errorPage !== undefined
            ? "404-page"
            : props.spa === true
                ? "spa"
                : "none",
        printUrl: isLocal,
        defaultPort: port,
        platform: "node",
    });
    if (isLocal) {
        const bun = yield* Effect.sync(() => process.execPath);
        const dev = yield* Command.Dev("Dev", {
            command: `${bun} ${servePath}`,
            cwd: path.dirname(servePath),
            env: {
                ...unwrapEnv(props.env),
                ALCHEMY_BUILD_HASH: build.hash.output,
                PORT: "0",
                HOST: "127.0.0.1",
            },
        }).pipe(Namespace.push(id));
        return {
            url: dev.url,
            server: undefined,
            service: undefined,
        };
    }
    const server = props.server !== undefined
        ? yield* resolveWebsiteServer(props)
        : yield* resolveWebsiteServer(props).pipe(Namespace.push(id));
    const service = yield* Service(id, {
        server,
        main: servePath,
        extraFiles: [
            {
                source: outdir,
                destination: path.basename(outdir),
            },
        ],
        port,
        env: {
            ...unwrapEnv(props.env),
            PORT: String(port),
        },
        // Generated static-file server is a complete bun/node program.
        isExternal: true,
    });
    if (props.domain !== undefined && props.zone !== undefined) {
        yield* bindWebsiteDomain({
            domain: props.domain,
            zone: props.zone,
            server,
            tags: props.tags,
        });
    }
    return {
        url: websiteUrl({ domain: props.domain, service, port }),
        server,
        service,
    };
}).pipe(Effect.orDie);
//# sourceMappingURL=StaticSite.js.map