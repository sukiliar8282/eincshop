import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Command from "../../Command/index.ts";
import type { InputProps } from "../../Input.ts";
import type { Providers } from "../Providers.ts";
import type { AssetsConfig } from "../Workers/Assets.ts";
import { Worker, type NormalizedBindings, type WorkerAssetsConfig, type WorkerBindingProps, type WorkerProps } from "../Workers/Worker.ts";
export interface StaticSiteProps<Bindings extends WorkerBindingProps = {}> extends Omit<WorkerProps<Bindings, WorkerAssetsConfig>, "assets" | "dev">, Omit<Command.BuildProps, "env"> {
    /**
     * Optional configuration for static asset routing behavior.
     * Supports `runWorkerFirst`, `htmlHandling`, `notFoundHandling`, etc.
     */
    assets?: AssetsConfig;
    /**
     * Local dev configuration. When `alchemy dev` runs, the build command is
     * skipped and `command` is spawned as a long-lived child process tied to
     * the stack's scope. Alchemy does not proxy or interpret the process —
     * the dev server's own URL (e.g. `http://localhost:5173`) is what you
     * open in the browser.
     *
     * @example
     * ```typescript
     * Cloudflare.Website.StaticSite("App", {
     *   command: "npm run build",
     *   outdir: "dist",
     *   main: "./src/worker.ts",
     *   dev: { command: "npm run dev" },
     * });
     * ```
     */
    dev?: {
        /**
         * Shell command to run as the local dev server (e.g. `npm run dev`).
         */
        command: string;
        /**
         * Working directory for {@link command}. Defaults to
         * {@link Command.BuildProps.cwd} (the build command's `cwd`), or
         * `process.cwd()` if neither is set.
         */
        cwd?: string;
        /**
         * Environment variables for {@link command}, merged on top of
         * `process.env`. When set, these replace the top-level `env` for the
         * dev process; otherwise the top-level `env` is passed through.
         * `Redacted` values stay out of logs and state, so put secrets here
         * rather than interpolating them into {@link command}.
         */
        env?: Record<string, string | Redacted.Redacted<string>>;
        /**
         * Override for the `url` output if alchemy fails to detect it from the stdout of the dev command
         */
        url?: string;
    };
}
type StaticSiteWorker<Bindings extends WorkerBindingProps> = Worker<{
    [binding in keyof NormalizedBindings<Bindings, WorkerAssetsConfig>]: NormalizedBindings<Bindings, WorkerAssetsConfig>[binding];
}>;
/**
 * A Cloudflare Worker that serves static assets built by a shell command.
 *
 * `StaticSite` runs a build command (e.g. `npm run build`), content-hashes
 * the output directory, and deploys the result as a Cloudflare Worker with
 * static assets. Use this when your site has its own build step that
 * produces a directory of files — Hugo, Zola, Eleventy, or any custom
 * pipeline.
 *
 * For Vite-based projects, prefer `Cloudflare.Website.Vite` which handles
 * building automatically.
 *
 *
 * ### Basic Usage
 * Point `command` at your build script and `outdir` at where it writes
 * output. Alchemy runs the command, hashes the output, and deploys it as
 * an assets-only Worker — no Worker code is uploaded, and Cloudflare's
 * asset layer serves every request itself.
 *
 * **Example:** Deploying a Hugo site
 * ```typescript
 * const site = yield* Cloudflare.Website.StaticSite("Blog", {
 *   command: "hugo --minify",
 *   outdir: "public",
 * });
 * ```
 *
 * Provide `main` to put your own Worker in front of the assets instead.
 * The Worker receives an `ASSETS` binding it can delegate to:
 *
 * ```typescript
 * // src/worker.ts
 * export default {
 *   fetch: (request: Request, env: { ASSETS: Fetcher }) =>
 *     env.ASSETS.fetch(request),
 * };
 * ```
 *
 * **Example:** Custom Worker in front of the assets
 * ```typescript
 * const site = yield* Cloudflare.Website.StaticSite("Blog", {
 *   command: "hugo --minify",
 *   outdir: "public",
 *   main: "./src/worker.ts",
 * });
 * ```
 *
 * ### Asset Configuration
 * Use `assets` to control how Cloudflare handles routing for
 * your static files — HTML handling, not-found behavior, etc.
 *
 * **Example:** SPA-style routing
 * ```typescript
 * const site = yield* Cloudflare.Website.StaticSite("App", {
 *   command: "npm run build",
 *   outdir: "dist",
 *   main: "./src/worker.ts",
 *   assets: {
 *     htmlHandling: "auto-trailing-slash",
 *     notFoundHandling: "single-page-application",
 *   },
 * });
 * ```
 *
 * ### Building from a Subdirectory
 * Set `cwd` to run the build command in a subdirectory (e.g. a
 * monorepo package). `outdir` is resolved relative to `cwd`.
 *
 * **Example:** Building a frontend in a monorepo
 * ```typescript
 * const site = yield* Cloudflare.Website.StaticSite("Web", {
 *   cwd: "apps/web",
 *   command: "npm run build",
 *   outdir: "dist",
 *   main: "apps/web/worker.ts",
 * });
 * ```
 *
 * ### Custom Rebuild Scope
 * By default, all non-gitignored files are hashed to decide whether
 * the build should re-run. Use `memo` to narrow the scope.
 *
 * **Example:** Narrowing the memo scope
 * ```typescript
 * const site = yield* Cloudflare.Website.StaticSite("Docs", {
 *   command: "npm run build",
 *   outdir: "dist",
 *   main: "./src/worker.ts",
 *   memo: {
 *     include: ["content/**", "templates/**", "config.toml"],
 *   },
 * });
 * ```
 *
 * **Example:** Rebuilding when a sibling workspace package changes
 * The default scope only hashes files under `cwd` (plus the nearest
 * lockfile), so edits to a sibling workspace package the app imports do
 * not retrigger the build on their own. Add the sibling's sources with a
 * `../` include glob — and keep `lockfile: true`, since providing
 * `include` otherwise drops the lockfile from the hash:
 * ```typescript
 * const site = yield* Cloudflare.Website.StaticSite("Web", {
 *   cwd: "apps/web",
 *   command: "npm run build",
 *   outdir: "dist",
 *   main: "./src/worker.ts",
 *   memo: {
 *     include: ["**\/*", "../../packages/env/src/**"],
 *     lockfile: true,
 *   },
 * });
 * ```
 *
 * ### Class Form
 * Calling `StaticSite` with no arguments returns a constructor you can
 * `extend` to declare the Worker as a named class. The class is both
 * an `Effect` you can `yield*` to deploy and a type you can reference
 * elsewhere — useful when other resources need to bind to this Worker.
 *
 * **Example:** Declaring a Worker class
 * ```typescript
 * class Blog extends Cloudflare.Website.StaticSite<Blog>()("Blog", {
 *   command: "hugo --minify",
 *   outdir: "public",
 *   main: "./src/worker.ts",
 * }) {}
 *
 * const site = yield* Blog;
 * ```
 *
 * @resource
 * @product Website
 * @category Workers & Compute
 */
export declare const StaticSite: {
    <Self>(): {
        <const Bindings extends WorkerBindingProps = {}, Req = never>(id: string, propsEff: InputProps<StaticSiteProps<Bindings>, "dev"> | Effect.Effect<InputProps<StaticSiteProps<Bindings>, "dev">, never, Req>): Effect.Effect<Self, never, Req | Providers> & {
            new (): StaticSiteWorker<Bindings>;
        };
    };
    <const Bindings extends WorkerBindingProps = {}, Req = never>(id: string, propsEff: InputProps<StaticSiteProps<Bindings>, "dev"> | Effect.Effect<InputProps<StaticSiteProps<Bindings>, "dev">, never, Req>): Effect.Effect<StaticSiteWorker<Bindings>, never, Req | Providers>;
};
export {};
//# sourceMappingURL=StaticSite.d.ts.map