import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import type * as Redacted from "effect/Redacted";
import { AlchemyContext } from "../../AlchemyContext.ts";
import * as Command from "../../Command/index.ts";
import type { MemoOptions } from "../../Command/Memo.ts";
import * as Output from "../../Output.ts";
import { App } from "../App.ts";
import { Certificate } from "../Certificate.ts";
import { IpAssignment } from "../IpAssignment.ts";
import { Service } from "../Service.ts";
import { type Ref, type WebsiteAssetsProps } from "./FrameworkSite.ts";
export interface StaticSiteProps {
    /**
     * Path to the local site directory (working directory for
     * {@link build.command}).
     * @default "."
     */
    path?: string;
    /**
     * Build executed before deploy.
     */
    build: {
        /** Shell command that produces the site (e.g. `"hugo --minify"`). */
        command: string;
        /** Directory the command writes, relative to {@link path}. */
        output: string;
        /** Environment variables for the build command. */
        env?: Record<string, string | Redacted.Redacted<string>>;
    };
    /**
     * Controls which files are hashed to decide whether the build re-runs.
     * @default true
     */
    memo?: MemoOptions | boolean;
    /**
     * Process environment for the hosted static server.
     */
    env?: Record<string, string | Redacted.Redacted<string>>;
    /**
     * Miss handling for the generated file server.
     */
    assets?: WebsiteAssetsProps;
    /**
     * Parent Fly App. When omitted, a `Fly.App` is created. The Service
     * stays in the caller namespace; only `Build` / `Dev` are pushed.
     */
    app?: Ref<App>;
    /**
     * Optional custom hostname. Requests ACME (`Fly.Certificate`) on the App.
     */
    domain?: string;
    /**
     * User-defined tags. Accepted for API parity; Fly Services do not
     * surface resource tags.
     */
    tags?: Record<string, string>;
    /**
     * Local dev configuration. When `alchemy dev` runs with `dev.command`,
     * the build is skipped and `command` is spawned as a long-lived child.
     */
    dev?: {
        /**
         * Shell command to run as the local dev server (e.g. `npm run dev`).
         */
        command: string;
        /**
         * Working directory for {@link command}. Defaults to {@link cwd}.
         */
        cwd?: string;
        /**
         * Environment variables for {@link command}.
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
 * Deploy a static site built by a shell command to Fly.
 *
 * `StaticSite` runs a build command (e.g. `npm run build` / `hugo`),
 * content-hashes the output directory, and deploys a Service that serves
 * those files (plus `/health`). Use this when the site has its own build
 * step — Hugo, Zola, Eleventy, or any custom pipeline.
 *
 * For Vite-based projects, prefer `Fly.Website.Vite`.
 *
 * `Build` / `Dev` use constant logical ids under `Namespace.push(id)`.
 * The Service stays in the caller namespace (same as
 * `Cloudflare.Website.StaticSite`).
 *
 *
 * ### Basic Usage
 * **Example:** Deploying a Hugo site
 * ```typescript
 * const site = yield* Fly.Website.StaticSite("Blog", {
 *   build: { command: "hugo --minify", output: "public" },
 * });
 * ```
 *
 * **Example:** SPA-style routing
 * ```typescript
 * const site = yield* Fly.Website.StaticSite("App", {
 *   build: { command: "npm run build", output: "dist" },
 *   assets: { notFoundHandling: "single-page-application" },
 * });
 * ```
 *
 * ### Building from a Subdirectory
 * **Example:** Building a frontend in a monorepo
 * ```typescript
 * const site = yield* Fly.Website.StaticSite("Web", {
 *   path: "apps/web",
 *   build: { command: "npm run build", output: "dist" },
 * });
 * ```
 *
 * ### Local Development
 * **Example:** External dev command
 * ```typescript
 * const site = yield* Fly.Website.StaticSite("App", {
 *   build: { command: "npm run build", output: "dist" },
 *   dev: { command: "npm run dev" },
 * });
 * ```
 *
 * @resource
 * @product Website
 */
export declare const StaticSite: (id: string, props: StaticSiteProps) => Effect.Effect<{
    app: App | undefined;
    service: Service | undefined;
    ip: IpAssignment | undefined;
    certificate: Certificate | undefined;
    url: Output.Output<string | undefined, never>;
} | {
    url: string | Output.Output<string, never>;
    app: App;
    service: Service;
    ip: IpAssignment;
    certificate: Certificate | undefined;
}, never, AlchemyContext | FileSystem.FileSystem | Path.Path | import("../../Provider.ts").Provider<Command.Build> | import("../../Provider.ts").Provider<Command.Dev> | import("../Providers.ts").Providers>;
//# sourceMappingURL=StaticSite.d.ts.map