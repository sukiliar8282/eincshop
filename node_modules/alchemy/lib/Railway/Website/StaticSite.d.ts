import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as Redacted from "effect/Redacted";
import { AlchemyContext } from "../../AlchemyContext.ts";
import * as Command from "../../Command/index.ts";
import type * as Output from "../../Output.ts";
import { Project } from "../Project.ts";
import { Service } from "../Service.ts";
import { type FrameworkSiteProps } from "./FrameworkSite.ts";
export interface StaticSiteProps extends Omit<Command.BuildProps, "env">, Pick<FrameworkSiteProps, "project" | "environment" | "domain" | "tags" | "env"> {
    /**
     * Local dev configuration. When `alchemy dev` runs with `dev.command`,
     * the build is skipped and `command` is spawned as a long-lived child
     * (`Command.Dev`). Without `dev.command`, the site still builds and a
     * local static server serves `outdir` — no Railway Service is created.
     */
    dev?: {
        /**
         * Shell command to run as the local dev server (e.g. `npm run dev`).
         */
        command: string;
        /**
         * Working directory for {@link command}. Defaults to
         * {@link Command.BuildProps.cwd}.
         */
        cwd?: string;
        /**
         * Environment variables for {@link command}, merged on top of
         * `process.env`.
         */
        env?: Record<string, string | Redacted.Redacted<string>>;
        /**
         * Override for the `url` output if alchemy fails to detect it from
         * the stdout of the dev command.
         */
        url?: string;
    };
    /**
     * Answer misses with the index page (200) instead of a 404 so
     * client-side routes deep-link. Mutually exclusive with {@link errorPage}.
     */
    spa?: boolean;
    /**
     * Serve this page (e.g. `404.html`) with status 404 when no file
     * matches. Mutually exclusive with {@link spa}.
     */
    errorPage?: string;
}
/**
 * A Railway Service that serves static assets built by a shell command.
 *
 * `StaticSite` runs a build command (e.g. `npm run build`), content-hashes
 * the output directory, and deploys the result as a Node static-file
 * server on one `Railway.Service`. Use this when your site has its own
 * build step that produces a directory of files — Hugo, Zola, Eleventy, or
 * any custom pipeline.
 *
 * For Vite-based projects, prefer {@link Vite | Railway.Website.Vite}
 * which handles building automatically.
 *
 * Cloudflare DX: top-level `command` + `outdir` (`Command.BuildProps`).
 * Only `Command.Build("Build")` / `Command.Dev("Dev")` are pushed under
 * the site id; the Service stays in the caller namespace.
 *
 * During `alchemy dev`, `dev.command` skips the build and is the site.
 * Without `dev.command`, the site still builds and a local static server
 * serves `outdir` — no Project or Service is created.
 *
 * ### Basic Usage
 * **Example:** Deploying a Hugo site
 * ```typescript
 * const site = yield* Railway.Website.StaticSite("Blog", {
 *   command: "hugo --minify",
 *   outdir: "public",
 * });
 * ```
 *
 * **Example:** SPA-style routing
 * ```typescript
 * const site = yield* Railway.Website.StaticSite("App", {
 *   command: "npm run build",
 *   outdir: "dist",
 *   spa: true,
 * });
 * ```
 *
 * ### Building from a Subdirectory
 * **Example:** Building a frontend in a monorepo
 * ```typescript
 * const site = yield* Railway.Website.StaticSite("Web", {
 *   cwd: "apps/web",
 *   command: "npm run build",
 *   outdir: "dist",
 * });
 * ```
 *
 * ### Local Development
 * **Example:** External dev command
 * ```typescript
 * const site = yield* Railway.Website.StaticSite("App", {
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
    url: string | Output.Output<string | undefined, never>;
    service: undefined;
    project: undefined;
} | {
    url: string;
    service: Service;
    project: Project;
} | {
    url: Output.Output<string | undefined, never>;
    service: Service;
    project: Project;
}, never, AlchemyContext | FileSystem.FileSystem | Path.Path | import("../../Provider.ts").Provider<Command.Build> | import("../../Provider.ts").Provider<Command.Dev> | import("../Providers.ts").Providers>;
//# sourceMappingURL=StaticSite.d.ts.map