import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import type * as Redacted from "effect/Redacted";
import { AlchemyContext } from "../../AlchemyContext.ts";
import * as Command from "../../Command/index.ts";
import type { MemoOptions } from "../../Command/Memo.ts";
import * as Output from "../../Output.ts";
import { Service } from "../Service.ts";
import { type FrameworkSiteProps } from "./FrameworkSite.ts";
export interface StaticSiteProps extends Pick<FrameworkSiteProps, "domain" | "zone" | "server" | "tags" | "env"> {
    /**
     * Shell command that produces the site (e.g. `hugo --minify`).
     */
    command: string;
    /**
     * Directory the command writes, relative to {@link cwd}.
     */
    outdir: string;
    /**
     * Working directory for {@link command}.
     * @default process.cwd()
     */
    cwd?: string;
    /**
     * Controls which files are hashed to decide whether the build re-runs.
     * @default true
     */
    memo?: MemoOptions | boolean;
    /**
     * Answer misses with the index page (200) instead of a 404 so
     * client-side routes deep-link correctly. Mutually exclusive with
     * {@link errorPage}.
     */
    spa?: boolean;
    /**
     * Serve this page with a real `404` status for requests that match no
     * file. Mutually exclusive with {@link spa}.
     */
    errorPage?: string;
    /**
     * Local dev configuration. When `alchemy dev` runs, the build command
     * is skipped and `command` is spawned as a long-lived child. Without
     * `dev`, the site is still built and served locally (no cloud Service).
     */
    dev?: {
        /**
         * Shell command to run as the local dev server (e.g. `npm run dev`).
         */
        command: string;
        /**
         * Working directory for {@link command}. Defaults to
         * {@link StaticSiteProps.cwd}.
         */
        cwd?: string;
        /**
         * Environment variables for {@link command}, merged on top of
         * `process.env`.
         */
        env?: Record<string, string | Redacted.Redacted<string>>;
        /**
         * Override for the `url` output if alchemy fails to detect it from
         * stdout of the dev command.
         */
        url?: string;
    };
}
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
export declare const StaticSite: (id: string, props: StaticSiteProps) => Effect.Effect<{
    url: Output.Output<string | undefined, never>;
    server: undefined;
    service: undefined;
} | {
    url: string | Output.Output<string | undefined, never>;
    server: import("../Server.ts").Server;
    service: Service;
}, never, AlchemyContext | FileSystem.FileSystem | Path.Path | import("../../Provider.ts").Provider<Command.Build> | import("../../Provider.ts").Provider<Command.Dev> | import("../Providers.ts").Providers>;
//# sourceMappingURL=StaticSite.d.ts.map